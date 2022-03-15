import * as ss58 from "@subsquid/ss58";
import { SubstrateNetwork } from "../../model";
import { Store, EventHandlerContext } from '@subsquid/substrate-processor';
import { TechnicalCommitteeProposedEvent } from "../../types/calamari/events";
import { getOrCreateGovernanceAccount, getOrCreateProposal, decodeAddress } from "../../utils";

export function handleProposedEvent(network: SubstrateNetwork) {
    return async (ctx: EventHandlerContext) => {
        const someEvent = getProposedEvent(ctx);

        const authorId = ss58.codec(network).encode(someEvent.author);
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
