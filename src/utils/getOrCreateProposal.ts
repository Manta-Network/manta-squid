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
    threshold: number,
    network: SubstrateNetwork
  }
): Promise<SubstrateTechcommProposal> {
  const account = await getOrCreate(store, SubstrateTechcommProposal, {
    ...params,
    state: ProposalState.proposed,
  });

  return account;
}
