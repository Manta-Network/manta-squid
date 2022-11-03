import type {Result} from './support'

export interface CancelledScheduledRequest {
  whenExecutable: number
  action: DelegationAction
}

export type DelegatorAdded = DelegatorAdded_AddedToTop | DelegatorAdded_AddedToBottom

export interface DelegatorAdded_AddedToTop {
  __kind: 'AddedToTop'
  newTotal: bigint
}

export interface DelegatorAdded_AddedToBottom {
  __kind: 'AddedToBottom'
}

export interface CandidateMetadata {
  bond: bigint
  delegationCount: number
  totalCounted: bigint
  lowestTopDelegationAmount: bigint
  highestBottomDelegationAmount: bigint
  lowestBottomDelegationAmount: bigint
  topCapacity: CapacityStatus
  bottomCapacity: CapacityStatus
  request: (CandidateBondLessRequest | undefined)
  status: CollatorStatus
}

export interface Delegator {
  id: Uint8Array
  delegations: Bond[]
  total: bigint
  lessTotal: bigint
  status: DelegatorStatus
}

export type DelegationAction = DelegationAction_Revoke | DelegationAction_Decrease

export interface DelegationAction_Revoke {
  __kind: 'Revoke'
  value: bigint
}

export interface DelegationAction_Decrease {
  __kind: 'Decrease'
  value: bigint
}

export type CapacityStatus = CapacityStatus_Full | CapacityStatus_Empty | CapacityStatus_Partial

export interface CapacityStatus_Full {
  __kind: 'Full'
}

export interface CapacityStatus_Empty {
  __kind: 'Empty'
}

export interface CapacityStatus_Partial {
  __kind: 'Partial'
}

export interface CandidateBondLessRequest {
  amount: bigint
  whenExecutable: number
}

export type CollatorStatus = CollatorStatus_Active | CollatorStatus_Idle | CollatorStatus_Leaving

export interface CollatorStatus_Active {
  __kind: 'Active'
}

export interface CollatorStatus_Idle {
  __kind: 'Idle'
}

export interface CollatorStatus_Leaving {
  __kind: 'Leaving'
  value: number
}

export interface Bond {
  owner: Uint8Array
  amount: bigint
}

export type DelegatorStatus = DelegatorStatus_Active | DelegatorStatus_Leaving

export interface DelegatorStatus_Active {
  __kind: 'Active'
}

export interface DelegatorStatus_Leaving {
  __kind: 'Leaving'
  value: number
}
