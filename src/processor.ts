import {lookupArchive} from "@subsquid/archive-registry";
import * as ss58 from "@subsquid/ss58";
import {BatchContext, BatchProcessorItem, BatchProcessorEventItem, SubstrateBatchProcessor, toHex, decodeHex, SubstrateBlock} from "@subsquid/substrate-processor";
import {Store, TypeormDatabase} from "@subsquid/typeorm-store";
import { Block, ChainContext, Event } from "./types/support";
import { ParachainStakingDelegatorStateStorage, ParachainStakingTotalStorage, ParachainStakingSelectedCandidatesStorage } from "./types/storage";
import { Delegator } from "./types/v3402";
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
import { ChainState, DelegatorAccount, DelegationBond, CollatorAccount } from "./model";
import { Chain } from "@subsquid/substrate-processor/lib/chain";

const processor = new SubstrateBatchProcessor()
  .setDataSource({
    // Lookup archive by the network name in the Subsquid registry
    archive: lookupArchive("calamari", { release: "FireSquid" }),
    chain: "wss://ws.archive.calamari.systems",
  })
  // Don't care until staking went live past block 2_000_000
  .setBlockRange({ from: 2_183_941 })
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

// Save period for data points
// 2 hours
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

async function processStaking(ctx: Context): Promise<void> {
  const delegatorsIdsHex = new Set<string>();
  const collatorIdsHex = new Set<string>();

  for (const block of ctx.blocks) {
    for (const item of block.items) {
      if (item.kind == "event") {
        processStakingEvents(ctx, item, delegatorsIdsHex, collatorIdsHex)
      }
    }

    if (lastStateTimestamp == null) {
      lastStateTimestamp =
        (await getLastChainState(ctx.store))?.timestamp.getTime() || 0;
    }

    if (block.header.timestamp - lastStateTimestamp >= SAVE_PERIOD) {
      const delegatorIdsU8 = [...delegatorsIdsHex].map((id) => decodeHex(id));
      const collatorIdsU8 = [...collatorIdsHex].map((id) => decodeHex(id));

      await saveDelegatorAccounts(ctx, block.header, delegatorIdsU8);
      await saveChainState(ctx, block.header, true);

      lastStateTimestamp = block.header.timestamp;
      delegatorsIdsHex.clear();
      collatorIdsHex.clear();
    }
  }

  const block = ctx.blocks[ctx.blocks.length - 1];
  const delegatorsIdsU8 = [...delegatorsIdsHex].map((id) => decodeHex(id));

  await saveDelegatorAccounts(ctx, block.header, delegatorsIdsU8);
  await saveChainState(ctx, block.header, false);
}

async function saveDelegatorAccounts(
  ctx: Context,
  block: SubstrateBlock,
  accountIds: Uint8Array[]
) {
  const delegatorInfo = await getDelegatorState(ctx, block, accountIds);
  if (!delegatorInfo) {
    ctx.log.warn("No delegator changes");
    return;
  }

  const delegatorAccounts = new Map<string, DelegatorAccount>();
  const delegatorDeletions = new Map<string, DelegatorAccount>();

  for (const delegator of delegatorInfo) {
    if (!delegator) continue;
    const id = encodeId(delegator.accountId);

    if (delegator.total > 0n) {
      delegatorAccounts.set(
        id,
        new DelegatorAccount({
          id,
          totalStaked: delegator.total,
          delegations: delegator.delegations,
          updatedAtBlock: block.height,
        })
      );
    } else {
      delegatorDeletions.set(id, new DelegatorAccount({ id }));
    }
  }

  await ctx.store.save([...delegatorAccounts.values()]);
  await ctx.store.remove([...delegatorDeletions.values()]);

  ctx.log
    .child("accounts")
    .info(`delegators updated: ${delegatorAccounts.size}, delegators deleted: ${delegatorDeletions.size}`);
}

async function getDelegatorState(ctx: ChainContext, block: Block, accounts: Uint8Array[]) {
  const storage = new ParachainStakingDelegatorStateStorage(ctx, block);
  if (!storage.isExists) return undefined;

  if (storage.isV3402) {
    const data = await storage.getManyAsV3402(accounts);
    const filteredData = data.filter((d): d is Delegator => d !== undefined);
    return filteredData.map((d) => ({ accountId: d.id, delegations: d.delegations.map((del) => new DelegationBond({owner: encodeId(del.owner), amount: del.amount})), total: d.total }));
  } else {
    return undefined;
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

async function saveChainState(
  ctx: Context,
  block: SubstrateBlock,
  isSave: boolean,
) {
  const state = await getChainState(ctx, block, isSave);
  await ctx.store.save(state);

  if (isSave) {
    ctx.log.child("state").info(`updated at block ${block.height}`);
  }
}

async function getChainState(
  ctx: Context,
  block: SubstrateBlock,
  isSave: boolean,
) {
  let state = new ChainState();

  if (isSave) {
    state = new ChainState({ id: block.id });
  } else {
    state = new ChainState({ id: "0" });
  }

  state.timestamp = new Date(block.timestamp);
  state.blockNumber = block.height;
  state.delegatorCount = await ctx.store.count(DelegatorAccount);
  state.totalStaked = (await getTotalStaked(ctx, block)) || 0n;
  state.activeCollatorCount = await getCollatorCount(ctx, block) || 0;

  return state;
}

async function getTotalStaked(ctx: ChainContext, block: Block) {
  const storage = new ParachainStakingTotalStorage(ctx, block);
  if (!storage.isExists) return undefined;

  if (storage.isV3402) {
    return await storage.getAsV3402();
  }

  throw new UnknownVersionError(storage.constructor.name);
}

async function getCollatorCount(ctx: ChainContext, block: Block) {
  const storage = new ParachainStakingSelectedCandidatesStorage(ctx, block);
  if (!storage.isExists) return undefined;

  if (storage.isV3402) {
    const collators = await storage.getAsV3402();
    return collators.length
  }

  throw new UnknownVersionError(storage.constructor.name);
}

export class UnknownVersionError extends Error {
  constructor(name: string) {
    super(`There is no relevant version for ${name}`);
  }
}

export function encodeId(id: Uint8Array) {
  return ss58.codec("calamari").encode(id);
}
