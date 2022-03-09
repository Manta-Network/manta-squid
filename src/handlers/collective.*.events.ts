import * as ss58 from "@subsquid/ss58";
import { SubstrateTechcommProposal, Account, SubstrateNetwork } from "../model";
import { Store, EventHandlerContext } from '@subsquid/substrate-processor';
import { TechnicalCommitteeApprovedEvent, TechnicalCommitteeClosedEvent, TechnicalCommitteeDisapprovedEvent, TechnicalCommitteeExecutedEvent, TechnicalCommitteeMemberExecutedEvent, TechnicalCommitteeProposedEvent, TechnicalCommitteeVotedEvent } from "../types/calamari/events";
import { getOrCreateGovernanceAccount } from "../utils";
import { decodeAddress } from '../utils';
import { getOrCreateProposal } from "../utils/getOrCreateGovernanceAccount";

export function handleProposalEvents(network: SubstrateNetwork) {
    return async (ctx: EventHandlerContext) => {
        const someEvent = getProposedEvent(ctx);

        const authorId = ss58.codec("calamari").encode(someEvent.author);
        const rootAccount = decodeAddress(authorId);
        const authorAcc = await getOrCreateGovernanceAccount(ctx.store, { id: authorId, rootAccount: rootAccount, network: network });
        await ctx.store.save(authorAcc);
        const proposal = await getOrCreateProposal(ctx.store,
            {
                id: someEvent.proposalId.toString(),
                proposal: '0x' + Buffer.from(someEvent.proposalHash).toString('hex'),
                proposer: authorAcc,
                introducedAtBlock: BigInt(ctx.block.height),
                date: new Date(ctx.block.timestamp),
                threshold: someEvent.threshold,
                network: SubstrateNetwork.calamari
            }
        );
        console.log("added proposal" + someEvent.proposalId);

        await ctx.store.save(proposal);
        // await ctx.store.save(
        //     new HistoricalBalance({
        //         id: `${ctx.event.id}-to`,
        //         account: fromAcc,
        //         balance: fromAcc.balance,
        //         date: new Date(ctx.block.timestamp),
        //     })
        // );

        // await ctx.store.save(
        //     new HistoricalBalance({
        //         id: `${ctx.event.id}-from`,
        //         account: toAcc,
        //         balance: toAcc.balance,
        //         date: new Date(ctx.block.timestamp),
        //     })
        // );
    };
}

interface ProposalEvent {
    author: Uint8Array;
    proposalId: number;
    proposalHash: Uint8Array;
    threshold: number;
}

function getProposedEvent(ctx: EventHandlerContext): ProposalEvent {
    const event = new TechnicalCommitteeProposedEvent(ctx);
    if (event.isV4) {
        const [acc, propId, propHash, thresh] = event.asV4;
        return { author: acc, proposalId: propId, proposalHash: propHash, threshold: thresh };
    }
    else if (event.isV3110) {
        const { account, proposalIndex, proposalHash, threshold } = event.asV3110;
        return { author: account, proposalId: proposalIndex, proposalHash, threshold };
    }
    else {
        throw new Error('event not implemented');
    }
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
