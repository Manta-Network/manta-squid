import {lookupArchive} from "@subsquid/archive-registry"
import * as ss58 from "@subsquid/ss58"
import {BatchContext, BatchProcessorItem, BatchProcessorEventItem, SubstrateBatchProcessor} from "@subsquid/substrate-processor"
import {Store, TypeormDatabase} from "@subsquid/typeorm-store"


const processor = new SubstrateBatchProcessor()
  .setDataSource({
    // Lookup archive by the network name in the Subsquid registry
    archive: lookupArchive("calamari", { release: "FireSquid" }),
    chain: "wss://ws.archive.calamari.systems",
  })
  // Don't care until staking went live past block 2_000_000
  .setBlockRange({ from: 2_000_000 })
  .addEvent("NewRound", {
    data: { event: { args: true } },
  } as const)

processor.run(new TypeormDatabase(), processStaking);

type Item = BatchProcessorItem<typeof processor>;
type EventItem = BatchProcessorEventItem<typeof processor>;
type Context = BatchContext<Store, Item>;

async function processStaking(ctx: Context): Promise<void> {
  const accountIdsHex = new Set<string>();
}
