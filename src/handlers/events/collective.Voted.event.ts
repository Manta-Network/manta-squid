import * as ss58 from "@subsquid/ss58";
import { SubstrateTechcommProposal, SubstrateNetwork, ProposalState, Vote } from "../../model";
import { Store, EventHandlerContext } from '@subsquid/substrate-processor';
import { TechnicalCommitteeVotedEvent } from "../../types/calamari/events";
import { decodeAddress } from "../../utils";

export function handleVotedEvent(network: SubstrateNetwork) {
    return async (ctx: EventHandlerContext) => {
        const someEvent = getVotedEvent(ctx);

        const authorId = ss58.codec(network).encode(someEvent.author);
        const rootAccount = decodeAddress(authorId);

        try {
            let hashString = '0x' + Buffer.from(someEvent.proposalHash).toString('hex');
            let proposal = await ctx.store.findOneOrFail<SubstrateTechcommProposal>(SubstrateTechcommProposal, { where: { proposal: hashString } });

            if (proposal.state == ProposalState.proposed) {
                proposal.state = ProposalState.voting;
                proposal.votes = [];
            }

            if (proposal.state != ProposalState.voting) {
                throw new Error('invalid proposal state');
            }
            proposal.votes!.push(new Vote({ voter: authorId, approve: someEvent.is_yes }));

            await ctx.store.save(proposal);
        } catch (e) {
            throw e;
        }



        // await ctx.store.save(proposal);
    };
}

interface VotedEvent {
    author: Uint8Array;
    proposalHash: Uint8Array;
    is_yes: boolean;
}

function getVotedEvent(ctx: EventHandlerContext): VotedEvent {
    const event = new TechnicalCommitteeVotedEvent(ctx);
    if (event.isV4) {
        const [acc, propHash, voted, yes, no] = event.asV4;
        return { author: acc, proposalHash: propHash, is_yes: voted };
    }
    else if (event.isV3110) {
        //   {account: v3110.AccountId32, proposalHash: v3110.H256, voted: boolean, yes: number, no: number}
        const { account, proposalHash, voted, yes, no } = event.asV3110;
        return { author: account, proposalHash, is_yes: voted };
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
