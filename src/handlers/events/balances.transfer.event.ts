import * as ss58 from "@subsquid/ss58";
import { Account, HistoricalBalance, SubstrateNetwork } from "../../model";
import { Store, EventHandlerContext } from '@subsquid/substrate-processor';
import { BalancesTransferEvent } from "../../types/calamari/events";

export default (network: SubstrateNetwork) =>
    async (ctx: EventHandlerContext) => {
        const transfer = getTransferEvent(ctx);
        const tip = ctx.extrinsic?.tip || 0n;
        const from = ss58.codec("calamari").encode(transfer.from);
        const to = ss58.codec("calamari").encode(transfer.to);

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
    };

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
