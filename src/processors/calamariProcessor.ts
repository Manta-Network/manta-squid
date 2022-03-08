import * as ss58 from "@subsquid/ss58";
import {
  EventHandlerContext,
  Store,
  SubstrateProcessor,
} from "@subsquid/substrate-processor";
import { Account, HistoricalBalance } from "../model";
import { BalancesTransferEvent } from "../types/calamari/events";


import councilVoteHandler from '../handlers/council.vote.extrinsic';
import democracyVoteHandler from '../handlers/democracy.vote.extrinsic';
import democracySecondHandler from '../handlers/democracy.second.extrinsic';
import electionVoteHandler from '../handlers/phragmenElection.vote.extrinsic';
import { SubstrateNetwork } from '../model';

{
  const processor = new SubstrateProcessor('litentry_squid_governance_calamari');

  // processor.setTypesBundle('khala');
  processor.setBatchSize(500);
  processor.setIsolationLevel('REPEATABLE READ');
  processor.setDataSource({
    archive: "https://calamari.indexer.gc.subsquid.io/v4/graphql",
    chain: "wss://calamari.api.onfinality.io/public-ws/",
  });
  // processor.addExtrinsicHandler(
  //   'phragmenElection.vote',
  //   electionVoteHandler(SubstrateNetwork.phala)
  // );
  processor.addExtrinsicHandler(
    'council.vote',
    councilVoteHandler(SubstrateNetwork.calamari)
  );
  processor.addExtrinsicHandler(
    'democracy.vote',
    democracyVoteHandler(SubstrateNetwork.calamari)
  );
  processor.addExtrinsicHandler(
    'democracy.second',
    democracySecondHandler(SubstrateNetwork.calamari)
  );

  processor.run();
}

{
  const processor = new SubstrateProcessor("kusama_balances");

  //processor.setTypesBundle("kusama");
  processor.setBatchSize(500);

  processor.setDataSource({
    archive: "https://calamari.indexer.gc.subsquid.io/v4/graphql",
    chain: "wss://calamari.api.onfinality.io/public-ws/",
  });

  processor.addEventHandler("balances.Transfer", async (ctx) => {
    const transfer = getTransferEvent(ctx);
    const tip = ctx.extrinsic?.tip || 0n;
    const from = ss58.codec("kusama").encode(transfer.from);
    const to = ss58.codec("kusama").encode(transfer.to);

    const fromAcc = await getOrCreate(ctx.store, Account, from);
    fromAcc.balance = fromAcc.balance || 0n;
    fromAcc.balance -= transfer.amount;
    fromAcc.balance -= tip;
    await ctx.store.save(fromAcc);

    const toAcc = await getOrCreate(ctx.store, Account, to);
    toAcc.balance = toAcc.balance || 0n;
    toAcc.balance += transfer.amount;
    await ctx.store.save(toAcc);

    await ctx.store.save(
      new HistoricalBalance({
        id: `${ctx.event.id}-to`,
        account: fromAcc,
        balance: fromAcc.balance,
        date: new Date(ctx.block.timestamp),
      })
    );

    await ctx.store.save(
      new HistoricalBalance({
        id: `${ctx.event.id}-from`,
        account: toAcc,
        balance: toAcc.balance,
        date: new Date(ctx.block.timestamp),
      })
    );
  });

  processor.run();
}
interface TransferEvent {
  from: Uint8Array;
  to: Uint8Array;
  amount: bigint;
}

function getTransferEvent(ctx: EventHandlerContext): TransferEvent {
  const event = new BalancesTransferEvent(ctx);
  if (event.isV1) {
    const [from, to, amount] = event.asV1;
    return { from, to, amount };
  }
  if (event.isV3110) {
    const { from, to, amount } = event.asV3110;
    return { from, to, amount };
  }
  return event.asLatest;
}

async function getOrCreate<T extends { id: string }>(
  store: Store,
  EntityConstructor: EntityConstructor<T>,
  id: string
): Promise<T> {
  let entity = await store.get<T>(EntityConstructor, {
    where: { id },
  });

  if (entity == null) {
    entity = new EntityConstructor();
    entity.id = id;
  }

  return entity;
}

type EntityConstructor<T> = {
  new(...args: any[]): T;
};
