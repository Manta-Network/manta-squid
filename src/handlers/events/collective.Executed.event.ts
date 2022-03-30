import { SubstrateTechcommProposal, SubstrateNetwork, ProposalState } from "../../model";
import { EventHandlerContext } from '@subsquid/substrate-processor';
import { TechnicalCommitteeExecutedEvent } from "../../types/calamari/events";

export function handleExecutedEvent(network: SubstrateNetwork) {
    return async (ctx: EventHandlerContext) => {
        const someEvent = getEvent(ctx);

        if (someEvent.successfully_executed) {
            try {
                let hashString = '0x' + Buffer.from(someEvent.proposalHash).toString('hex');
                let proposal = await ctx.store.findOneOrFail<SubstrateTechcommProposal>(SubstrateTechcommProposal, { where: { proposal: hashString } });

                if (proposal.state == ProposalState.approved) {
                    proposal.state = ProposalState.enacted;
                } else {
                    throw new Error('invalid proposal state');
                }
                await ctx.store.save(proposal);
            } catch (e) {
                throw e;
            }
        } else {
            // the proposal was not successfully enacted, so it just stays in its previous state
            // throw new Error('Failed execution path not yet implemented'); // TODO
        }
    };
}

interface Event {
    proposalHash: Uint8Array;
    successfully_executed: boolean;
}

function getEvent(ctx: EventHandlerContext): Event {
    const event = new TechnicalCommitteeExecutedEvent(ctx);
    if (event.isV4) {
        const [proposalHash, result] = event.asV4;
        let is_ok = result.__kind == "Ok";
        return { proposalHash, successfully_executed: is_ok };
    }
    else if (event.isV3110) {
        const { proposalHash, result } = event.asV3110;
        let is_ok = result.__kind == "Ok";
        return { proposalHash, successfully_executed: is_ok };
    }
    else if (event.isV3140) {
        const { proposalHash, result } = event.asV3140;
        let is_ok = result.__kind == "Ok";
        return { proposalHash, successfully_executed: is_ok };
    }
    else {
        throw new Error('event not implemented');
    }
}