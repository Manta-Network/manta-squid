import { Store } from '@subsquid/substrate-processor';
import { getOrCreate } from './store';
import { ProposalState, SubstrateGovernanceAccount, SubstrateNetwork, SubstrateTechcommProposal } from '../model';

export async function getOrCreateGovernanceAccount(
  store: Store,
  params: {
    id: string;
    rootAccount: string;
    network: SubstrateNetwork;
  }
): Promise<SubstrateGovernanceAccount> {
  const account = await getOrCreate(store, SubstrateGovernanceAccount, {
    ...params,
    totalElectionVotes: 0,
    totalProposalVotes: 0,
    totalProposalSeconds: 0,
    electionVotes: [],
    proposalVotes: [],
    proposalSeconds: [],
  });

  return account;
}

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
