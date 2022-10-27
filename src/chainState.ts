import { BatchContext, SubstrateBlock } from "@subsquid/substrate-processor";
import { Store } from "@subsquid/typeorm-store";
import { Account, ChainState } from "./model";
import { UnknownVersionError } from "./processor";
import { BalancesTotalIssuanceStorage } from "./types/generated/storage";
import { Block, ChainContext } from "./types/generated/support";

export async function getChainState(
  ctx: BatchContext<Store, unknown>,
  block: SubstrateBlock
) {
  const state = new ChainState({ id: block.id });

  state.timestamp = new Date(block.timestamp);
  state.blockNumber = block.height;
  state.totalIssuance = (await getTotalIssuance(ctx, block)) || 0n;

  state.tokenHolders = await ctx.store.count(Account);

  return state;
}

export async function saveRegularChainState(
  ctx: BatchContext<Store, unknown>,
  block: SubstrateBlock
) {
  const state = await getChainState(ctx, block);
  await ctx.store.insert(state);

  ctx.log.child("state").info(`updated at block ${block.height}`);
}

async function getTotalIssuance(ctx: ChainContext, block: Block) {
  const storage = new BalancesTotalIssuanceStorage(ctx, block);
  if (!storage.isExists) return undefined;

  if (storage.isV1) {
    return await storage.getAsV1();
  }

  throw new UnknownVersionError(storage.constructor.name);
}
