import { lookupArchive } from "@subsquid/archive-registry";
import * as ss58 from "@subsquid/ss58";
import {
  BatchContext,
  BatchProcessorItem,
  BatchProcessorEventItem,
  SubstrateBatchProcessor,
} from "@subsquid/substrate-processor";
import { Store, TypeormDatabase } from "@subsquid/typeorm-store";

const processor = new SubstrateBatchProcessor()
  .setDataSource({
    // Use archive created by archive/docker-compose.yml
    archive: lookupArchive("calamari", { release: "FireSquid" }),
  })
  .addEvent("MantaPay.PrivateTransfer", {
    data: { event: {args: true } },
  } as const);

type Item = BatchProcessorItem<typeof processor>;
type EventItem = BatchProcessorEventItem<typeof processor>;
type Context = BatchContext<Store, Item>;

processor.run(new TypeormDatabase(), processMantaPay);

async function processMantaPay(ctx: Context): Promise<void> {
    for (const block of ctx.blocks) {
        for (const item of block.items) {
            if (item.kind == "event") {

            }
        }
    }
}

async function processMantaPayEvents(ctx: Context, item: EventItem) {

}

