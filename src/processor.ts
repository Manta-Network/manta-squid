import {lookupArchive} from "@subsquid/archive-registry";
import * as ss58 from "@subsquid/ss58";
import {BatchContext, BatchProcessorItem, BatchProcessorEventItem, SubstrateBatchProcessor, toHex} from "@subsquid/substrate-processor";
import {Store, TypeormDatabase} from "@subsquid/typeorm-store";
import { ChainContext, Event } from "./types/support";
import {
  ParachainStakingDelegationDecreaseScheduledEvent,
  ParachainStakingDelegationIncreasedEvent,
  ParachainStakingDelegationDecreasedEvent,
  ParachainStakingDelegatorExitScheduledEvent,
  ParachainStakingDelegationRevocationScheduledEvent,
  ParachainStakingDelegatorLeftEvent,
  ParachainStakingDelegationRevokedEvent,
  ParachainStakingDelegationKickedEvent,
  ParachainStakingDelegatorExitCancelledEvent,
  ParachainStakingCancelledDelegationRequestEvent,
  ParachainStakingDelegationEvent,
  ParachainStakingDelegatorLeftCandidateEvent,
  ParachainStakingRewardedEvent
} from "./types/events";

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
  const delegatorsIdsHex = new Set<string>();
  const collatorIdsHex = new Set<string>();

  for (const block of ctx.blocks) {
    for (const item of block.items) {
      if (item.kind == "event") {
        processStakingEvents(ctx, item, delegatorsIdsHex, collatorIdsHex)
      }
    }
  }
}

function processStakingEvents(
  ctx: Context,
  item: EventItem,
  delegatorAccountIds: Set<string>,
  collatorAccountIds: Set<string>
) {
  switch (item.name) {
    case "ParachainStaking.DelegationDecreaseScheduled": {
      const accounts = getDelegationDecreaseScheduled(ctx, item.event);
      delegatorAccountIds.add(accounts.delegator);
      collatorAccountIds.add(accounts.collator);
      break;
    }
    case "ParachainStaking.DelegationIncreased": {
      const accounts = getDelegationIncreased(ctx, item.event);
      delegatorAccountIds.add(accounts.delegator);
      collatorAccountIds.add(accounts.collator);
      break
    }
    case "ParachainStaking.DelegationDecreased": {
      const accounts = getDelegationDecreased(ctx, item.event);
      delegatorAccountIds.add(accounts.delegator);
      collatorAccountIds.add(accounts.collator);
      break;
    }
    case "ParachainStaking.DelegatorExitScheduled": {
      const account = getDelegatorExitScheduled(ctx, item.event);

      delegatorAccountIds.add(account.delegator);
      break;
    }
    case "ParachainStaking.DelegationRevocationScheduled": {
      const accounts = getDelegationRevocationScheduled(ctx, item.event);

      delegatorAccountIds.add(accounts.delegator);
      collatorAccountIds.add(accounts.collator);
      break;
    }
    case "ParachainStaking.DelegatorLeft": {
      const accounts = getDelegatorLeft(ctx, item.event);

      delegatorAccountIds.add(accounts.delegator);
      break;
    }
    case "ParachainStaking.DelegationRevoked": {
      const accounts = getDelegationRevoked(ctx, item.event)

      delegatorAccountIds.add(accounts.delegator);
      collatorAccountIds.add(accounts.collator);
      break;
    }
    case "ParachainStaking.DelegationKicked": {
      const accounts = getDelegationKicked(ctx, item.event)

      delegatorAccountIds.add(accounts.delegator);
      collatorAccountIds.add(accounts.collator);
      break;
    }
    case "ParachainStaking.DelegationKicked": {
      const account = getDelegatorExitCancelled(ctx, item.event)

      delegatorAccountIds.add(account.delegator);
      break;
    }
    case "ParachainStaking.CancelledDelegationRequest": {
      const accounts = getCancelledDelegationRequest(ctx, item.event)

      delegatorAccountIds.add(accounts.delegator);
      collatorAccountIds.add(accounts.collator);
      break;
    }
    case "ParachainStaking.Delegation": {
      const accounts = getDelegation(ctx, item.event)

      delegatorAccountIds.add(accounts.delegator);
      collatorAccountIds.add(accounts.collator);
      break;
    }
    case "ParachainStaking.DelegatorLeftCandidate": {
      const accounts = getDelegatorLeftCandidate(ctx, item.event)

      delegatorAccountIds.add(accounts.delegator);
      collatorAccountIds.add(accounts.collator);
      break;
    }
    case "ParachainStaking.Rewarded": {
      const account = getRewarded(ctx, item.event)

      delegatorAccountIds.add(account.account);
      break;
    }
  }
}

function getDelegationDecreaseScheduled(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegationDecreaseScheduledEvent(ctx, event);

  if (data.isV3402) {
    return {delegator: toHex(data.asV3402.delegator), collator: toHex(data.asV3402.candidate)};
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegationIncreased(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegationIncreasedEvent(ctx, event);

  if (data.isV3402) {
    return {delegator: toHex(data.asV3402.delegator), collator: toHex(data.asV3402.candidate)};
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegationDecreased(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegationDecreasedEvent(ctx, event);

  if (data.isV3402) {
    return {delegator: toHex(data.asV3402.delegator), collator: toHex(data.asV3402.candidate)}
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegatorExitScheduled(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegatorExitScheduledEvent(ctx, event);

  if (data.isV3402) {
    return {delegator: toHex(data.asV3402.delegator)}
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegationRevocationScheduled(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegationRevocationScheduledEvent(ctx, event);

  if (data.isV3402) {
    return {delegator: toHex(data.asV3402.delegator), collator: toHex(data.asV3402.candidate)}
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegatorLeft(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegatorLeftEvent(ctx, event);

  if (data.isV3402) {
    return {delegator: toHex(data.asV3402.delegator)}
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegationRevoked(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegationRevokedEvent(ctx, event);

  if (data.isV3402) {
    return {delegator: toHex(data.asV3402.delegator), collator: toHex(data.asV3402.candidate)}
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegationKicked(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegationKickedEvent(ctx, event);

  if (data.isV3402) {
    return {delegator: toHex(data.asV3402.delegator), collator: toHex(data.asV3402.candidate)}
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegatorExitCancelled(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegatorExitCancelledEvent(ctx, event);

  if (data.isV3402) {
    return {delegator: toHex(data.asV3402.delegator)}
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getCancelledDelegationRequest(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingCancelledDelegationRequestEvent(ctx, event);

  if (data.isV3402) {
    return {delegator: toHex(data.asV3402.delegator), collator: toHex(data.asV3402.collator)}
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegation(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegationEvent(ctx, event);

  if (data.isV3402) {
    return {delegator: toHex(data.asV3402.delegator), collator: toHex(data.asV3402.candidate)}
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegatorLeftCandidate(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegatorLeftCandidateEvent(ctx, event);

  if (data.isV3402) {
    return {delegator: toHex(data.asV3402.delegator), collator: toHex(data.asV3402.candidate)}
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getRewarded(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingRewardedEvent(ctx, event);

  if (data.isV3402) {
    return {account: toHex(data.asV3402.account)}
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

export class UnknownVersionError extends Error {
  constructor(name: string) {
    super(`There is no relevant version for ${name}`);
  }
}
