import { BatchContext, SubstrateBlock } from "@subsquid/substrate-processor";
import { Store } from "@subsquid/typeorm-store";
import { Account, ChainState } from "./model";
import { UnknownVersionError } from "./processor";
import { BalancesTotalIssuanceStorage } from "./types/generated/storage";
import { Block, ChainContext } from "./types/generated/support";

export async function getChainState(
  ctx: BatchContext<Store, unknown>,
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
  state.totalIssuance = (await getTotalIssuance(ctx, block)) || 0n;

  state.tokenHolders = await ctx.store.count(Account);

  return state;
}

export async function saveRegularChainState(
  ctx: BatchContext<Store, unknown>,
  block: SubstrateBlock,
  isSave: boolean
) {
  const state = await getChainState(ctx, block, isSave);
  await ctx.store.save(state);

  if (isSave) {
    ctx.log.child("state").info(`updated at block ${block.height}`);
  }
}

async function getTotalIssuance(ctx: ChainContext, block: Block) {
  const storage = new BalancesTotalIssuanceStorage(ctx, block);
  if (!storage.isExists) return undefined;

  if (storage.isV1) {
    return await storage.getAsV1();
  }

  throw new UnknownVersionError(storage.constructor.name);
}
