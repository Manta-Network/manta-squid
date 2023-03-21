import { lookupArchive } from "@subsquid/archive-registry";
import * as ss58 from "@subsquid/ss58";
import {
  BatchContext,
  BatchProcessorItem,
  BatchProcessorEventItem,
  SubstrateBatchProcessor,
  toHex,
} from "@subsquid/substrate-processor";
import { Store, TypeormDatabase } from "@subsquid/typeorm-store";
import { ToPrivate, ToPublic, PrivateTransfer, Asset } from "./model";
import { ChainContext, Event } from "./types/support";
import {
  MantaPayPrivateTransferEvent,
  MantaPayToPrivateEvent,
  MantaPayToPublicEvent,
} from "./types/events";

const processor = new SubstrateBatchProcessor()
  .setDataSource({
    // Use archive created by archive/docker-compose.yml
    archive: lookupArchive("calamari", { release: "FireSquid" }),
  })
  .addEvent("MantaPay.PrivateTransfer", {
    data: { event: { args: true } },
  } as const)
  .addEvent("MantaPay.ToPrivate", {
    data: { event: { args: true } },
  } as const)
  .addEvent("MantaPay.ToPublic", {
    data: { event: { args: true } },
  } as const);

type Item = BatchProcessorItem<typeof processor>;
type EventItem = BatchProcessorEventItem<typeof processor>;
type Context = BatchContext<Store, Item>;

processor.run(new TypeormDatabase(), processMantaPay);

async function processMantaPay(ctx: Context): Promise<void> {
  let toPublicList: ToPublic[] = [];
  let toPrivateList: ToPrivate[] = [];
  let privateTransferList: PrivateTransfer[] = [];

  for (const block of ctx.blocks) {
    for (const item of block.items) {
      if (item.kind == "event") {
        switch (item.name) {
          case "MantaPay.PrivateTransfer": {
            const privateTransfer = getPrivateTransfer(ctx, item.event);
            privateTransferList.push(
              new PrivateTransfer({
                id: item.event.id,
                blockNumber: block.header.height,
                timestamp: new Date(block.header.timestamp),
                account: privateTransfer.origin,
              })
            );
            break;
          }
          case "MantaPay.ToPublic": {
            const toPublic = getToPublic(ctx, item.event);
            toPublicList.push(
              new ToPublic({
                id: item.event.id,
                blockNumber: block.header.height,
                timestamp: new Date(block.header.timestamp),
                sink: toPublic.sink,
                asset: toPublic.asset,
              })
            );
            break;
          }
          case "MantaPay.ToPrivate": {
            const toPrivate = getToPrivate(ctx, item.event);
            toPrivateList.push(
              new ToPrivate({
                id: item.event.id,
                blockNumber: block.header.height,
                timestamp: new Date(block.header.timestamp),
                source: toPrivate.source,
                asset: toPrivate.asset,
              })
            );
            break;
          }
        }
      }
    }
  }

  await ctx.store.insert(toPrivateList);
  await ctx.store.insert(toPublicList);
  await ctx.store.insert(privateTransferList);
}

function getToPublic(ctx: ChainContext, event: Event) {
  const data = new MantaPayToPublicEvent(ctx, event);

  if (data.isV4010) {
    return {
      sink: toHex(data.asV4010.sink),
      asset: new Asset({
        id: toHex(data.asV4010.asset.id),
        amount: toHex(data.asV4010.asset.value),
      }),
    };
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getToPrivate(ctx: ChainContext, event: Event) {
  const data = new MantaPayToPrivateEvent(ctx, event);

  if (data.isV4010) {
    return {
      source: toHex(data.asV4010.source),
      asset: new Asset({
        id: toHex(data.asV4010.asset.id),
        amount: toHex(data.asV4010.asset.value),
      }),
    };
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getPrivateTransfer(ctx: ChainContext, event: Event) {
  const data = new MantaPayPrivateTransferEvent(ctx, event);

  if (data.isV4010) {
    if (data.asV4010.origin) {
      return {
        origin: toHex(data.asV4010.origin),
      };
    } else {
      return {};
    }
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

export class UnknownVersionError extends Error {
  constructor(name: string) {
    super(`There is no relevant version for ${name}`);
  }
}
