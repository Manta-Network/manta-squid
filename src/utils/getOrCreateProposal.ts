import { Store } from '@subsquid/substrate-processor';
import { getOrCreate } from './store';
import { ProposalState, SubstrateGovernanceAccount, SubstrateNetwork, SubstrateTechcommProposal } from '../model';

export async function getOrCreateProposal(
  store: Store,
  params: {
    id: string,
    proposal: string,
    proposer: SubstrateGovernanceAccount,
    introducedAtBlock: bigint,
    date: Date,
    voteThreshold: number,
    network: SubstrateNetwork
  }
): Promise<SubstrateTechcommProposal> {
  const account = await getOrCreate(store, SubstrateTechcommProposal, {
    ...params,
    state: ProposalState.proposed,
    ayes: 0,
    nays: 0,
    voteCount: 0
  });

  return account;
}
