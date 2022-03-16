import { SubstrateTechcommProposal, SubstrateNetwork, ProposalState } from "../../model";
import { Store, EventHandlerContext } from '@subsquid/substrate-processor';
import { TechnicalCommitteeClosedEvent } from "../../types/calamari/events";

export function handleClosedEvent(network: SubstrateNetwork) {
    return async (ctx: EventHandlerContext) => {
        const someEvent = getEvent(ctx);

        try {
            let hashString = '0x' + Buffer.from(someEvent.proposalHash).toString('hex');
            let proposal = await ctx.store.findOneOrFail<SubstrateTechcommProposal>(SubstrateTechcommProposal, { where: { proposal: hashString } });

            if (proposal.state != ProposalState.voting) {
                throw new Error('invalid proposal state');
            }
            proposal.state = ProposalState.closed;
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
    const event = new TechnicalCommitteeClosedEvent(ctx);
    if (event.isV4) {
        const [proposalHash, yes, no] = event.asV4;
        return { proposalHash };
    }
    else if (event.isV3110) {
        const { proposalHash, yes, no } = event.asV3110;
        return { proposalHash };
    }
    else {
        throw new Error('event not implemented');
    }
}