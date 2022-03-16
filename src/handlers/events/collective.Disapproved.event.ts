import { SubstrateTechcommProposal, Account, SubstrateNetwork, ProposalState } from "../../model";
import { EventHandlerContext } from '@subsquid/substrate-processor';
import { TechnicalCommitteeDisapprovedEvent } from "../../types/calamari/events";

export function handleDisapprovedEvent(network: SubstrateNetwork) {
    return async (ctx: EventHandlerContext) => {
        const someEvent = getEvent(ctx);

        try {
            let hashString = '0x' + Buffer.from(someEvent.proposalHash).toString('hex');
            let proposal = await ctx.store.findOneOrFail<SubstrateTechcommProposal>(SubstrateTechcommProposal, { where: { proposal: hashString } });

            if (proposal.state != ProposalState.closed) {
                throw new Error('invalid proposal state');
            }
            proposal.state = ProposalState.disapproved;
            await ctx.store.save(proposal);
        } catch (e) {
            throw e;
        }
    };
}

interface Event {
    proposalHash: Uint8Array;
}

function getEvent(ctx: EventHandlerContext): Event {
    const event = new TechnicalCommitteeDisapprovedEvent(ctx);
    if (event.isV4) {
        const proposalHash = event.asV4;
        return { proposalHash };
    }
    else if (event.isV3110) {
        //   {proposalHash: v3110.H256} 
        const { proposalHash } = event.asV3110;
        return { proposalHash };
    }
    else {
        throw new Error('event not implemented');
    }
}