import { lookupArchive } from "@subsquid/archive-registry";
import * as ss58 from "@subsquid/ss58";
import {
  BatchContext,
  BatchProcessorItem,
  BatchProcessorEventItem,
  SubstrateBatchProcessor,
  toHex,
  decodeHex,
  SubstrateBlock,
} from "@subsquid/substrate-processor";
import { Store, TypeormDatabase } from "@subsquid/typeorm-store";
import { Block, ChainContext, Event } from "./types/support";
import {
  ParachainStakingDelegatorStateStorage,
  ParachainStakingTotalStorage,
  ParachainStakingSelectedCandidatesStorage,
  ParachainStakingCandidateInfoStorage,
} from "./types/storage";
import { Delegator, CandidateMetadata } from "./types/v3402";
import {
  ParachainStakingJoinedCollatorCandidatesEvent,
  ParachainStakingCollatorChosenEvent,
  ParachainStakingCandidateBondLessRequestedEvent,
  ParachainStakingCandidateBondedMoreEvent,
  ParachainStakingCandidateBondedLessEvent,
  ParachainStakingCandidateWentOfflineEvent,
  ParachainStakingCandidateBackOnlineEvent,
  ParachainStakingCandidateScheduledExitEvent,
  ParachainStakingCancelledCandidateExitEvent,
  ParachainStakingCancelledCandidateBondLessEvent,
  ParachainStakingCandidateLeftEvent,
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
  ParachainStakingRewardedEvent,
  ParachainStakingNewRoundEvent,
} from "./types/events";
import {
  ChainState,
  DelegatorAccount,
  DelegationBond,
  CollatorAccount,
  EndOfRound,
} from "./model";

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
  .includeAllBlocks();

processor.run(new TypeormDatabase(), processStaking);

type Item = BatchProcessorItem<typeof processor>;
type EventItem = BatchProcessorEventItem<typeof processor>;
type Context = BatchContext<Store, Item>;

// Save period for data points
// 2 hours
const SAVE_PERIOD = 2 * 60 * 60 * 1000;
let lastStateTimestamp: number | undefined;
let round = {
  currentBlockNumber: 0,
  currentRound: 0,
  previousBlockNumber: 0,
  changed: true,
};
let collators: Uint8Array[] | undefined = undefined;

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
  let rewards = new Map<string, bigint>();

  for (const block of ctx.blocks) {
    for (const item of block.items) {
      if (item.kind == "event") {
        processStakingEvents(
          ctx,
          item,
          delegatorsIdsHex,
          collatorIdsHex,
          rewards,
          round
        );
      }

      ctx.log.debug(`rewards ${rewards.size}`);
      if (round.changed) {
        let previousSize = 0;
        if (rewards.size != previousSize) {
          previousSize = rewards.size;
        } else {
          ctx.log
            .child("round data")
            .info(`Round ${round.currentRound - 1} complete!`);
          round.changed = false;

          if (collators !== undefined) {
            ctx.log.info(`roundData: ${round.currentBlockNumber}`);
            await saveRoundData(ctx, collators, rewards, round);
            rewards.clear();
          }
          collators = await getSelectedColators(ctx, block.header);
        }
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
      await saveCollatorAccounts(ctx, block.header, collatorIdsU8);
      await saveChainState(ctx, block.header, true);

      lastStateTimestamp = block.header.timestamp;
      delegatorsIdsHex.clear();
      collatorIdsHex.clear();
    }
  }

  const block = ctx.blocks[ctx.blocks.length - 1];
  const delegatorsIdsU8 = [...delegatorsIdsHex].map((id) => decodeHex(id));
  const collatorIdsU8 = [...collatorIdsHex].map((id) => decodeHex(id));

  await saveDelegatorAccounts(ctx, block.header, delegatorsIdsU8);
  await saveCollatorAccounts(ctx, block.header, collatorIdsU8);
  await saveChainState(ctx, block.header, false);
}

async function saveRoundData(
  ctx: Context,
  collators: Uint8Array[] | undefined,
  rewards: Map<string, bigint>,
  roundData: any
) {
  if (!collators) {
    ctx.log.warn("collators are undefined");
    return;
  }
  const collatorString = collators.map((x) => toHex(x));
  let endData = undefined;

  for (let [who, reward] of rewards) {
    ctx.log.info(`rewards: who: ${who}, reward: ${reward}`);
    const isCollator = collatorString.includes(who);

    if (isCollator) {
      if (endData) {
        await ctx.store.save(endData);
      }
      endData = new EndOfRound({
        id: who,
        blockNumber: roundData.previousBlockNumber,
        roundNumber: roundData.currentData - 1,
        stakingRewards: reward,
      });
    } else {
      if (endData) {
        endData.stakingRewards += reward;
      }
    }
  }
}

async function saveDelegatorAccounts(
  ctx: Context,
  block: SubstrateBlock,
  accountIds: Uint8Array[]
) {
  const delegatorInfo = await getDelegatorState(ctx, block, accountIds);
  if (!delegatorInfo) {
    ctx.log.debug("No delegator changes");
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
    .child("delegator accounts")
    .info(
      `delegators updated: ${delegatorAccounts.size}, delegators deleted: ${delegatorDeletions.size}`
    );
}

async function getDelegatorState(
  ctx: ChainContext,
  block: Block,
  accounts: Uint8Array[]
) {
  const storage = new ParachainStakingDelegatorStateStorage(ctx, block);
  if (!storage.isExists) return undefined;

  if (storage.isV3402) {
    const data = await storage.getManyAsV3402(accounts);
    const filteredData = data.filter((d): d is Delegator => d !== undefined);
    return filteredData.map((d) => ({
      accountId: d.id,
      delegations: d.delegations.map(
        (del) =>
          new DelegationBond({ owner: encodeId(del.owner), amount: del.amount })
      ),
      total: d.total,
    }));
  } else {
    return undefined;
  }
}

async function saveCollatorAccounts(
  ctx: Context,
  block: SubstrateBlock,
  accountIds: Uint8Array[]
) {
  const collatorInfo = await getCollatorState(ctx, block, accountIds);
  if (!collatorInfo) {
    ctx.log.debug("No delegator changes");
    return;
  }

  const collatorAccounts = new Map<string, CollatorAccount>();
  const collatorDeletions = new Map<string, CollatorAccount>();

  for (const collator of collatorInfo) {
    if (!collator) continue;
    const id = encodeId(collator.accountId);

    if (collator.total > 0n) {
      collatorAccounts.set(
        id,
        new CollatorAccount({
          id,
          totalBond: collator.total,
          selfBond: collator.selfBond,
          delegationCount: collator.delegationCount,
          updatedAtBlock: block.height,
        })
      );
    } else {
      collatorDeletions.set(id, new CollatorAccount({ id }));
    }
  }

  await ctx.store.save([...collatorAccounts.values()]);
  await ctx.store.remove([...collatorDeletions.values()]);

  ctx.log
    .child("collator accounts")
    .info(
      `collators updated: ${collatorAccounts.size}, collator deleted: ${collatorDeletions.size}`
    );
}

async function getCollatorState(
  ctx: ChainContext,
  block: Block,
  accounts: Uint8Array[]
) {
  const storage = new ParachainStakingCandidateInfoStorage(ctx, block);
  if (!storage.isExists) return undefined;

  if (storage.isV3402) {
    const data = await storage.getManyAsV3402(accounts);
    const dataWithAccountId = data.map((d, index) => ({
      account: accounts[index],
      metadata: d,
    }));
    const filteredData = dataWithAccountId.filter(
      (data): data is { account: Uint8Array; metadata: CandidateMetadata } =>
        data.metadata !== undefined
    );
    return filteredData.map((d) => ({
      accountId: d.account,
      selfBond: d.metadata.bond,
      delegationCount: d.metadata.delegationCount,
      total: d.metadata.totalCounted,
    }));
  } else {
    return undefined;
  }
}

function processStakingEvents(
  ctx: Context,
  item: EventItem,
  delegatorAccountIds: Set<string>,
  collatorAccountIds: Set<string>,
  rewards: Map<string, bigint>,
  round: any
) {
  switch (item.name) {
    case "ParachainStaking.JoinedCollatorCandidates": {
      const account = getJoinedCollatorCandidates(ctx, item.event);
      collatorAccountIds.add(account);
      break;
    }
    case "ParachainStaking.CollatorChosen": {
      const account = getCollatorChosen(ctx, item.event);
      collatorAccountIds.add(account);
      break;
    }
    case "ParachainStaking.CandidateBondLessRequested": {
      const account = getCandidateBondedLessRequested(ctx, item.event);
      collatorAccountIds.add(account);
      break;
    }
    case "ParachainStaking.CandidateBondedMore": {
      const account = getCandidateBondedMore(ctx, item.event);
      collatorAccountIds.add(account);
      break;
    }
    case "ParachainStaking.CandidateBondedLess": {
      const account = getCandidateBondedLess(ctx, item.event);
      collatorAccountIds.add(account);
      break;
    }
    case "ParachainStaking.CandidateWentOffline": {
      const account = getCandidateWentOffline(ctx, item.event);
      collatorAccountIds.add(account);
      break;
    }
    case "ParachainStaking.CandidateBackOnline": {
      const account = getCandidateBackOnline(ctx, item.event);
      collatorAccountIds.add(account);
      break;
    }
    case "ParachainStaking.CandidateScheduledExit": {
      const account = getCandidateScheduledExit(ctx, item.event);
      collatorAccountIds.add(account);
      break;
    }
    case "ParachainStaking.CancelledCandidateExit": {
      const account = getCancelledCandidateExit(ctx, item.event);
      collatorAccountIds.add(account);
      break;
    }
    case "ParachainStaking.CancelledCandidateBondLess": {
      const account = getCancelledCandidateBondLess(ctx, item.event);
      collatorAccountIds.add(account);
      break;
    }
    case "ParachainStaking.CandidateLeft": {
      const account = getCandidateLeft(ctx, item.event);
      collatorAccountIds.add(account);
      break;
    }
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
      break;
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
      const accounts = getDelegationRevoked(ctx, item.event);

      delegatorAccountIds.add(accounts.delegator);
      collatorAccountIds.add(accounts.collator);
      break;
    }
    case "ParachainStaking.DelegationKicked": {
      const accounts = getDelegationKicked(ctx, item.event);

      delegatorAccountIds.add(accounts.delegator);
      collatorAccountIds.add(accounts.collator);
      break;
    }
    case "ParachainStaking.DelegationKicked": {
      const account = getDelegatorExitCancelled(ctx, item.event);

      delegatorAccountIds.add(account.delegator);
      break;
    }
    case "ParachainStaking.CancelledDelegationRequest": {
      const accounts = getCancelledDelegationRequest(ctx, item.event);

      delegatorAccountIds.add(accounts.delegator);
      collatorAccountIds.add(accounts.collator);
      break;
    }
    case "ParachainStaking.Delegation": {
      const accounts = getDelegation(ctx, item.event);

      delegatorAccountIds.add(accounts.delegator);
      collatorAccountIds.add(accounts.collator);
      break;
    }
    case "ParachainStaking.DelegatorLeftCandidate": {
      const accounts = getDelegatorLeftCandidate(ctx, item.event);

      delegatorAccountIds.add(accounts.delegator);
      collatorAccountIds.add(accounts.collator);
      break;
    }
    case "ParachainStaking.Rewarded": {
      const data = getRewarded(ctx, item.event);

      delegatorAccountIds.add(data.account);
      rewards.set(data.account, data.amount);
      break;
    }
    case "ParachainStaking.NewRound": {
      const [blockNumber, roundNumber] = getNewRound(ctx, item.event);
      round.previousBlockNumber = round.currentBlockNumber;
      round.currentBlockNumber = blockNumber;
      round.currentRound = roundNumber;
      round.changed = true;
      break;
    }
  }
}

function getNewRound(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingNewRoundEvent(ctx, event);

  if (data.isV3402) {
    const blockNumber = data.asV3402.startingBlock;
    const roundNumber = data.asV3402.round;
    return [blockNumber, roundNumber];
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getJoinedCollatorCandidates(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingJoinedCollatorCandidatesEvent(ctx, event);

  if (data.isV3402) {
    return toHex(data.asV3402.account);
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getCollatorChosen(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingCollatorChosenEvent(ctx, event);

  if (data.isV3402) {
    return toHex(data.asV3402.collatorAccount);
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getCandidateBondedLessRequested(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingCandidateBondLessRequestedEvent(ctx, event);

  if (data.isV3402) {
    return toHex(data.asV3402.candidate);
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getCandidateBondedMore(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingCandidateBondedMoreEvent(ctx, event);

  if (data.isV3402) {
    return toHex(data.asV3402.candidate);
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getCandidateBondedLess(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingCandidateBondedLessEvent(ctx, event);

  if (data.isV3402) {
    return toHex(data.asV3402.candidate);
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getCandidateWentOffline(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingCandidateWentOfflineEvent(ctx, event);

  if (data.isV3402) {
    return toHex(data.asV3402.candidate);
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getCandidateBackOnline(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingCandidateBackOnlineEvent(ctx, event);

  if (data.isV3402) {
    return toHex(data.asV3402.candidate);
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getCandidateScheduledExit(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingCandidateScheduledExitEvent(ctx, event);

  if (data.isV3402) {
    return toHex(data.asV3402.candidate);
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getCancelledCandidateExit(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingCancelledCandidateExitEvent(ctx, event);

  if (data.isV3402) {
    return toHex(data.asV3402.candidate);
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getCancelledCandidateBondLess(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingCancelledCandidateBondLessEvent(ctx, event);

  if (data.isV3402) {
    return toHex(data.asV3402.candidate);
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getCandidateLeft(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingCandidateLeftEvent(ctx, event);

  if (data.isV3402) {
    return toHex(data.asV3402.exCandidate);
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegationDecreaseScheduled(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegationDecreaseScheduledEvent(ctx, event);

  if (data.isV3402) {
    return {
      delegator: toHex(data.asV3402.delegator),
      collator: toHex(data.asV3402.candidate),
    };
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegationIncreased(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegationIncreasedEvent(ctx, event);

  if (data.isV3402) {
    return {
      delegator: toHex(data.asV3402.delegator),
      collator: toHex(data.asV3402.candidate),
    };
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegationDecreased(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegationDecreasedEvent(ctx, event);

  if (data.isV3402) {
    return {
      delegator: toHex(data.asV3402.delegator),
      collator: toHex(data.asV3402.candidate),
    };
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegatorExitScheduled(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegatorExitScheduledEvent(ctx, event);

  if (data.isV3402) {
    return { delegator: toHex(data.asV3402.delegator) };
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegationRevocationScheduled(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegationRevocationScheduledEvent(
    ctx,
    event
  );

  if (data.isV3402) {
    return {
      delegator: toHex(data.asV3402.delegator),
      collator: toHex(data.asV3402.candidate),
    };
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegatorLeft(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegatorLeftEvent(ctx, event);

  if (data.isV3402) {
    return { delegator: toHex(data.asV3402.delegator) };
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegationRevoked(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegationRevokedEvent(ctx, event);

  if (data.isV3402) {
    return {
      delegator: toHex(data.asV3402.delegator),
      collator: toHex(data.asV3402.candidate),
    };
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegationKicked(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegationKickedEvent(ctx, event);

  if (data.isV3402) {
    return {
      delegator: toHex(data.asV3402.delegator),
      collator: toHex(data.asV3402.candidate),
    };
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegatorExitCancelled(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegatorExitCancelledEvent(ctx, event);

  if (data.isV3402) {
    return { delegator: toHex(data.asV3402.delegator) };
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getCancelledDelegationRequest(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingCancelledDelegationRequestEvent(ctx, event);

  if (data.isV3402) {
    return {
      delegator: toHex(data.asV3402.delegator),
      collator: toHex(data.asV3402.collator),
    };
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegation(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegationEvent(ctx, event);

  if (data.isV3402) {
    return {
      delegator: toHex(data.asV3402.delegator),
      collator: toHex(data.asV3402.candidate),
    };
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getDelegatorLeftCandidate(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingDelegatorLeftCandidateEvent(ctx, event);

  if (data.isV3402) {
    return {
      delegator: toHex(data.asV3402.delegator),
      collator: toHex(data.asV3402.candidate),
    };
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

function getRewarded(ctx: ChainContext, event: Event) {
  const data = new ParachainStakingRewardedEvent(ctx, event);

  if (data.isV3402) {
    return {
      account: toHex(data.asV3402.account),
      amount: data.asV3402.rewards,
    };
  } else {
    throw new UnknownVersionError(data.constructor.name);
  }
}

async function saveChainState(
  ctx: Context,
  block: SubstrateBlock,
  isSave: boolean
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
  isSave: boolean
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
  state.activeCollatorCount = (await getCollatorCount(ctx, block)) || 0;

  return state;
}

async function getSelectedColators(ctx: ChainContext, block: Block) {
  const storage = new ParachainStakingSelectedCandidatesStorage(ctx, block);
  if (!storage.isExists) return undefined;

  if (storage.isV3402) {
    const collators = await storage.getAsV3402();
    return collators;
  }

  throw new UnknownVersionError(storage.constructor.name);
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
    return collators.length;
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
