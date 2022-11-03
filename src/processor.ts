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
  .addEvent("ParachainStaking.NewRound", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.JoinedCollatorCandidates", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.CollatorChosen", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.CandidateBondLessRequested", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.CandidateBondedMore", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.CandidateBondedLess", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.CandidateWentOffline", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.CandidateBackOnline", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.CandidateScheduledExit", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.CancelledCandidateExit", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.CancelledCandidateBondLess", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.CandidateLeft", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.DelegationDecreaseScheduled", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.DelegationIncreased", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.DelegationDecreased", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.DelegatorExitScheduled", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.DelegationRevocationScheduled", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.DelegatorLeft", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.DelegationRevoked", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.DelegationKicked", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.DelegatorExitCancelled", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.CancelledDelegationRequest", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.Delegation", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.DelegatorLeftCandidate", {
    data: { event: { args: true } },
  } as const)
  .addEvent("ParachainStaking.Rewarded", {
    data: { event: { args: true } },
  } as const)
  .includeAllBlocks()

processor.run(new TypeormDatabase(), processStaking);

type Item = BatchProcessorItem<typeof processor>;
type EventItem = BatchProcessorEventItem<typeof processor>;
type Context = BatchContext<Store, Item>;

async function processStaking(ctx: Context): Promise<void> {
  const delagatorsIdsHex = new Set<string>();
}
