import { lookupArchive } from "@subsquid/archive-registry";
import * as ss58 from "@subsquid/ss58";
import {
  BatchContext,
  BatchProcessorItem,
  SubstrateBatchProcessor,
  BatchProcessorEventItem,
  SubstrateBlock,
  decodeHex,
  toHex,
} from "@subsquid/substrate-processor";
import { Store, TypeormDatabase } from "@subsquid/typeorm-store";
import { Account, ChainState } from "./model";
import {
  BalancesBalanceSetEvent,
  BalancesDepositEvent,
  BalancesEndowedEvent,
  BalancesReservedEvent,
  BalancesReserveRepatriatedEvent,
  BalancesSlashedEvent,
  BalancesUnreservedEvent,
  BalancesWithdrawEvent,
  BalancesTransferEvent,
} from "./types/generated/events";
import { Block, ChainContext, Event } from "./types/generated/support";
import { SystemAccountStorage } from "./types/generated/storage";
import { saveRegularChainState } from "./chainState";

const processor = new SubstrateBatchProcessor()
  .setDataSource({
    // Lookup archive by the network name in the Subsquid registry
    archive: lookupArchive("calamari", { release: "FireSquid" }),
    chain: "wss://salad.calamari.systems",
  })
  // Decoding fails at 275_910-275_940, due to metadata V13, tranfers are only from multisig upgrade of wasm runtime (Not super important)
  .setBlockRange({ from: 275_941 })
  .addEvent("Balances.Endowed", {
    data: { event: { args: true } },
  } as const)
  .addEvent("Balances.Transfer", {
    data: { event: { args: true } },
  } as const)
  .addEvent("Balances.BalanceSet", {
    data: { event: { args: true } },
  } as const)
  .addEvent("Balances.Reserved", {
    data: { event: { args: true } },
  } as const)
  .addEvent("Balances.Unreserved", {
    data: { event: { args: true } },
  } as const)
  .addEvent("Balances.ReserveRepatriated", {
    data: { event: { args: true } },
  } as const)
  .addEvent("Balances.Deposit", {
    data: { event: { args: true } },
  } as const)
  .addEvent("Balances.Withdraw", {
    data: { event: { args: true } },
  } as const)
  .addEvent("Balances.Slashed", {
    data: { event: { args: true } },
  } as const)
  .includeAllBlocks();

type Item = BatchProcessorItem<typeof processor>;
type EventItem = BatchProcessorEventItem<typeof processor>;
type Context = BatchContext<Store, Item>;

// Save period for data points
// 1 hours
const SAVE_PERIOD = 2 * 60 * 60 * 1000;
let lastStateTimestamp: number | undefined;

async function getLastChainState(store: Store) {
  return await store.get(ChainState, {
    where: {},
    order: {
      timestamp: "DESC",
    },
  });
}

processor.run(new TypeormDatabase(), processBalances);

async function processBalances(ctx: Context): Promise<void> {
  const accountIdsHex = new Set<string>();

  for (const block of ctx.blocks) {
    for (const item of block.items) {
      if (item.kind == "event") {
        processBalancesEventItem(ctx, item, accountIdsHex);
      }

      if (lastStateTimestamp == null) {
        lastStateTimestamp =
          (await getLastChainState(ctx.store))?.timestamp.getTime() || 0;
      }

      if (block.header.timestamp - lastStateTimestamp >= SAVE_PERIOD) {
        const accountIdsU8 = [...accountIdsHex].map((id) => decodeHex(id));

        await saveAccounts(ctx, block.header, accountIdsU8);
        await saveRegularChainState(ctx, block.header, true);

        lastStateTimestamp = block.header.timestamp;
        accountIdsHex.clear();
      }
    }
  }

  const block = ctx.blocks[ctx.blocks.length - 1];
  const accountIdsU8 = [...accountIdsHex].map((id) => decodeHex(id));

  await saveRegularChainState(ctx, block.header, false);
  await saveAccounts(ctx, block.header, accountIdsU8);
}

function processBalancesEventItem(
  ctx: Context,
  item: EventItem,
  accountIdsHex: Set<string>
) {
  switch (item.name) {
    case "Balances.BalanceSet": {
      const account = getBalanceSetAccount(ctx, item.event);
      accountIdsHex.add(account);
      break;
    }
    case "Balances.Endowed": {
      const account = getEndowedAccount(ctx, item.event);
      accountIdsHex.add(account);
      break;
    }
    case "Balances.Deposit": {
      const account = getDepositAccount(ctx, item.event);
      accountIdsHex.add(account);
      break;
    }
    case "Balances.Reserved": {
      const account = getReservedAccount(ctx, item.event);
      accountIdsHex.add(account);
      break;
    }
    case "Balances.Unreserved": {
      const account = getUnreservedAccount(ctx, item.event);
      accountIdsHex.add(account);
      break;
    }
    case "Balances.Withdraw": {
      const account = getWithdrawAccount(ctx, item.event);
      accountIdsHex.add(account);
      break;
    }
    case "Balances.Slashed": {
      const account = getSlashedAccount(ctx, item.event);
      accountIdsHex.add(account);
      break;
    }
    case "Balances.Transfer": {
      const accounts = getTransferAccounts(ctx, item.event);
      accountIdsHex.add(accounts[0]);
      accountIdsHex.add(accounts[1]);
      break;
    }
    case "Balances.ReserveRepatriated": {
      const accounts = getReserveRepatriatedAccounts(ctx, item.event);
      accountIdsHex.add(accounts[0]);
      accountIdsHex.add(accounts[1]);
      break;
    }
  }
}

function getBalanceSetAccount(ctx: ChainContext, event: Event) {
  const data = new BalancesBalanceSetEvent(ctx, event);

  if (data.isV1) {
    return toHex(data.asV1[0]);
  } else if (data.isV3110) {
    return toHex(data.asV3110.who);
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getTransferAccounts(ctx: ChainContext, event: Event) {
  const data = new BalancesTransferEvent(ctx, event);

  if (data.isV1) {
    return [toHex(data.asV1[0]), toHex(data.asV1[1])];
  } else if (data.isV3110) {
    return [toHex(data.asV3110.from), toHex(data.asV3110.to)];
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getEndowedAccount(ctx: ChainContext, event: Event) {
  const data = new BalancesEndowedEvent(ctx, event);

  if (data.isV1) {
    return toHex(data.asV1[0]);
  } else if (data.isV3110) {
    return toHex(data.asV3110.account);
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDepositAccount(ctx: ChainContext, event: Event) {
  const data = new BalancesDepositEvent(ctx, event);

  if (data.isV1) {
    return toHex(data.asV1[0]);
  } else if (data.isV3110) {
    return toHex(data.asV3110.who);
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getReservedAccount(ctx: ChainContext, event: Event) {
  const data = new BalancesReservedEvent(ctx, event);

  if (data.isV1) {
    return toHex(data.asV1[0]);
  } else if (data.isV3110) {
    return toHex(data.asV3110.who);
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getUnreservedAccount(ctx: ChainContext, event: Event) {
  const data = new BalancesUnreservedEvent(ctx, event);

  if (data.isV1) {
    return toHex(data.asV1[0]);
  } else if (data.isV3110) {
    return toHex(data.asV3110.who);
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getWithdrawAccount(ctx: ChainContext, event: Event) {
  const data = new BalancesWithdrawEvent(ctx, event);

  if (data.isV3100) {
    return toHex(data.asV3100[0]);
  } else if (data.isV3110) {
    return toHex(data.asV3110.who);
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getSlashedAccount(ctx: ChainContext, event: Event) {
  const data = new BalancesSlashedEvent(ctx, event);

  if (data.isV3100) {
    return toHex(data.asV3100[0]);
  } else if (data.isV3110) {
    return toHex(data.asV3110.who);
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getReserveRepatriatedAccounts(ctx: ChainContext, event: Event) {
  const data = new BalancesReserveRepatriatedEvent(ctx, event);

  if (data.isV1) {
    return [toHex(data.asV1[0]), toHex(data.asV1[1])];
  } else if (data.isV3110) {
    return [toHex(data.asV3110.from), toHex(data.asV3110.to)];
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

async function saveAccounts(
  ctx: Context,
  block: SubstrateBlock,
  accountIds: Uint8Array[]
) {
  const balances = await getBalances(ctx, block, accountIds);
  if (!balances) {
    ctx.log.warn("No balances");
    return;
  }

  const accounts = new Map<string, Account>();
  const deletions = new Map<string, Account>();

  for (let i = 0; i < accountIds.length; i++) {
    const id = encodeId(accountIds[i]);
    const balance = balances[i];

    if (!balance) continue;
    const total = balance.free + balance.reserved;
    if (total > 0n) {
      accounts.set(
        id,
        new Account({
          id,
          free: balance.free,
          reserved: balance.reserved,
          total,
          updatedAt: block.height,
        })
      );
    } else {
      deletions.set(id, new Account({ id }));
    }
  }

  await ctx.store.save([...accounts.values()]);
  await ctx.store.remove([...deletions.values()]);

  ctx.log
    .child("accounts")
    .info(`updated: ${accounts.size}, deleted: ${deletions.size}`);
}

interface Balance {
  free: bigint;
  reserved: bigint;
}

async function getBalances(
  ctx: ChainContext,
  block: Block,
  accounts: Uint8Array[]
): Promise<Balance[] | undefined> {
  return await getSystemAccountBalances(ctx, block, accounts);
}

async function getSystemAccountBalances(
  ctx: ChainContext,
  block: Block,
  accounts: Uint8Array[]
) {
  const storage = new SystemAccountStorage(ctx, block);
  if (!storage.isExists) return undefined;

  if (storage.isV1) {
    const data = await storage.getManyAsV1(accounts);
    return data.map((d) => ({ free: d.data.free, reserved: d.data.reserved }));
  } else {
    const data = await storage.getManyAsV3(accounts);
    return data.map((d) => ({ free: d.data.free, reserved: d.data.reserved }));
  }
}

export class UnknownVersionError extends Error {
  constructor(name: string) {
    super(`There is no relevant version for ${name}`);
  }
}

export function encodeId(id: Uint8Array) {
  return ss58.codec("calamari").encode(id);
}
