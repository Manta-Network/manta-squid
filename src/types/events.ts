import assert from 'assert'
import {Chain, ChainContext, EventContext, Event, Result} from './support'
import * as v3402 from './v3402'

export class ParachainStakingCancelledCandidateBondLessEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.CancelledCandidateBondLess')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Cancelled request to decrease candidate's bond.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.CancelledCandidateBondLess') === 'bad2bb017b2205b3b15c75ff6fdd7f0bb8d59d5fd14df4cb8874b21292f699a8'
  }

  /**
   * Cancelled request to decrease candidate's bond.
   */
  get asV3402(): {candidate: Uint8Array, amount: bigint, executeRound: number} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingCancelledCandidateExitEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.CancelledCandidateExit')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Cancelled request to leave the set of candidates.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.CancelledCandidateExit') === '3628b3aba77dce2d54e6db67e810eccf17921a84b907aea8b90a342fd5ad6c01'
  }

  /**
   * Cancelled request to leave the set of candidates.
   */
  get asV3402(): {candidate: Uint8Array} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingCancelledDelegationRequestEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.CancelledDelegationRequest')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Cancelled request to change an existing delegation.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.CancelledDelegationRequest') === '8aedfed09d22a5851676a3041c7dfb0161f0b4423f7156ac758a2ca32812a2a5'
  }

  /**
   * Cancelled request to change an existing delegation.
   */
  get asV3402(): {delegator: Uint8Array, cancelledRequest: v3402.CancelledScheduledRequest, collator: Uint8Array} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingCandidateBackOnlineEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.CandidateBackOnline')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Candidate rejoins the set of collator candidates.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.CandidateBackOnline') === '3628b3aba77dce2d54e6db67e810eccf17921a84b907aea8b90a342fd5ad6c01'
  }

  /**
   * Candidate rejoins the set of collator candidates.
   */
  get asV3402(): {candidate: Uint8Array} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingCandidateBondLessRequestedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.CandidateBondLessRequested')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Candidate requested to decrease a self bond.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.CandidateBondLessRequested') === '1d9dd427739469ad726bf81a0c0b38805035667c30e6a9fe377548316553a7a3'
  }

  /**
   * Candidate requested to decrease a self bond.
   */
  get asV3402(): {candidate: Uint8Array, amountToDecrease: bigint, executeRound: number} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingCandidateBondedLessEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.CandidateBondedLess')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Candidate has decreased a self bond.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.CandidateBondedLess') === '29dfa3e28f81d3d1053aa8a109068e837e27bd18c2fd1255bf4a84b3f4ad3646'
  }

  /**
   * Candidate has decreased a self bond.
   */
  get asV3402(): {candidate: Uint8Array, amount: bigint, newBond: bigint} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingCandidateBondedMoreEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.CandidateBondedMore')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Candidate has increased a self bond.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.CandidateBondedMore') === '3555667014ed491dbe7285cd00ca93d412ddafe3f0519d33df883a1f5f0b60ee'
  }

  /**
   * Candidate has increased a self bond.
   */
  get asV3402(): {candidate: Uint8Array, amount: bigint, newTotalBond: bigint} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingCandidateLeftEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.CandidateLeft')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Candidate has left the set of candidates.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.CandidateLeft') === '9455507cee1dbacfcddf86bf2afec2f8fa01f688a383fc7d913c342da2331154'
  }

  /**
   * Candidate has left the set of candidates.
   */
  get asV3402(): {exCandidate: Uint8Array, unlockedAmount: bigint, newTotalAmtLocked: bigint} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingCandidateScheduledExitEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.CandidateScheduledExit')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Candidate has requested to leave the set of candidates.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.CandidateScheduledExit') === 'd448041a4a1bdbe3492a1dc2516bebab567198a414d72b2eaa4254ed7248297c'
  }

  /**
   * Candidate has requested to leave the set of candidates.
   */
  get asV3402(): {exitAllowedRound: number, candidate: Uint8Array, scheduledExit: number} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingCandidateWentOfflineEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.CandidateWentOffline')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Candidate temporarily leave the set of collator candidates without unbonding.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.CandidateWentOffline') === '3628b3aba77dce2d54e6db67e810eccf17921a84b907aea8b90a342fd5ad6c01'
  }

  /**
   * Candidate temporarily leave the set of collator candidates without unbonding.
   */
  get asV3402(): {candidate: Uint8Array} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingCollatorChosenEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.CollatorChosen')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Candidate selected for collators. Total Exposed Amount includes all delegations.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.CollatorChosen') === 'e39a7c1cbb003367ccb2e8ac99ff67fe973f19c8f4d0ba8fdd754a846bc02fa0'
  }

  /**
   * Candidate selected for collators. Total Exposed Amount includes all delegations.
   */
  get asV3402(): {round: number, collatorAccount: Uint8Array, totalExposedAmount: bigint} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingDelegationEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.Delegation')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * New delegation (increase of the existing one).
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.Delegation') === 'dbeb00002e0e711f8d6ab1758ba836f98f14598de2f5e4c546d3c3ac2bb88f85'
  }

  /**
   * New delegation (increase of the existing one).
   */
  get asV3402(): {delegator: Uint8Array, lockedAmount: bigint, candidate: Uint8Array, delegatorPosition: v3402.DelegatorAdded} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingDelegationDecreaseScheduledEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.DelegationDecreaseScheduled')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Delegator requested to decrease a bond for the collator candidate.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.DelegationDecreaseScheduled') === 'dad0c96a1d19cefcdee6c3f1d15faf2e2984df101d71591df8e4f8db32ebc673'
  }

  /**
   * Delegator requested to decrease a bond for the collator candidate.
   */
  get asV3402(): {delegator: Uint8Array, candidate: Uint8Array, amountToDecrease: bigint, executeRound: number} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingDelegationDecreasedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.DelegationDecreased')
    this._chain = ctx._chain
    this.event = event
  }

  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.DelegationDecreased') === '578d871808b851f365c061fed4bb2e04ce24d572792f345fb055d2c4dff71471'
  }

  get asV3402(): {delegator: Uint8Array, candidate: Uint8Array, amount: bigint, inTop: boolean} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingDelegationIncreasedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.DelegationIncreased')
    this._chain = ctx._chain
    this.event = event
  }

  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.DelegationIncreased') === '578d871808b851f365c061fed4bb2e04ce24d572792f345fb055d2c4dff71471'
  }

  get asV3402(): {delegator: Uint8Array, candidate: Uint8Array, amount: bigint, inTop: boolean} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingDelegationKickedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.DelegationKicked')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Delegation kicked.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.DelegationKicked') === 'ee999c83b6b0952280ddb043c0b936ad93e99efd43b619a9cb433e75452693e7'
  }

  /**
   * Delegation kicked.
   */
  get asV3402(): {delegator: Uint8Array, candidate: Uint8Array, unstakedAmount: bigint} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingDelegationRevocationScheduledEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.DelegationRevocationScheduled')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Delegator requested to revoke delegation.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.DelegationRevocationScheduled') === '6ee92edd1ee620fc58d5573f822c739bef3db08530370007a65e0e324c7fd1ac'
  }

  /**
   * Delegator requested to revoke delegation.
   */
  get asV3402(): {round: number, delegator: Uint8Array, candidate: Uint8Array, scheduledExit: number} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingDelegationRevokedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.DelegationRevoked')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Delegation revoked.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.DelegationRevoked') === 'ee999c83b6b0952280ddb043c0b936ad93e99efd43b619a9cb433e75452693e7'
  }

  /**
   * Delegation revoked.
   */
  get asV3402(): {delegator: Uint8Array, candidate: Uint8Array, unstakedAmount: bigint} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingDelegatorExitCancelledEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.DelegatorExitCancelled')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Cancelled a pending request to exit the set of delegators.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.DelegatorExitCancelled') === '3d3838bcdd21a8f0595cc9cd424acf3d984b169d1503483ecf5a480bda8b126e'
  }

  /**
   * Cancelled a pending request to exit the set of delegators.
   */
  get asV3402(): {delegator: Uint8Array} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingDelegatorExitScheduledEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.DelegatorExitScheduled')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Delegator requested to leave the set of delegators.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.DelegatorExitScheduled') === 'b0ecb7b0e9d90e91d46ad2884adf3275ce434f0de306b44b7dd8e6c0ac096270'
  }

  /**
   * Delegator requested to leave the set of delegators.
   */
  get asV3402(): {round: number, delegator: Uint8Array, scheduledExit: number} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingDelegatorLeftEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.DelegatorLeft')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Delegator has left the set of delegators.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.DelegatorLeft') === 'f36a8c40c8ea325606e0c9f58919ca14407f237efae652798cd82614cbb5639d'
  }

  /**
   * Delegator has left the set of delegators.
   */
  get asV3402(): {delegator: Uint8Array, unstakedAmount: bigint} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingDelegatorLeftCandidateEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.DelegatorLeftCandidate')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Delegation from candidate state has been remove.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.DelegatorLeftCandidate') === 'b5d039328045457ec2ccd3b61a64e0187b8398b0e1a9f8f670d96680ad9e297a'
  }

  /**
   * Delegation from candidate state has been remove.
   */
  get asV3402(): {delegator: Uint8Array, candidate: Uint8Array, unstakedAmount: bigint, totalCandidateStaked: bigint} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingJoinedCollatorCandidatesEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.JoinedCollatorCandidates')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Account joined the set of collator candidates.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.JoinedCollatorCandidates') === '893e64af1fd9bde84d8749ef70be7dc46cb8974c5ccb1f7dcdb8f0b5c2ad4db7'
  }

  /**
   * Account joined the set of collator candidates.
   */
  get asV3402(): {account: Uint8Array, amountLocked: bigint, newTotalAmtLocked: bigint} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingNewRoundEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.NewRound')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Started new round.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.NewRound') === '36b479d535ff0b4066a6ca7641a4dba5e090be428fc6b6e9fe8fec13d953fcfb'
  }

  /**
   * Started new round.
   */
  get asV3402(): {startingBlock: number, round: number, selectedCollatorsNumber: number, totalBalance: bigint} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingRewardedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.Rewarded')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Paid the account (delegator or collator) the balance as liquid rewards.
   */
  get isV3402(): boolean {
    return this._chain.getEventHash('ParachainStaking.Rewarded') === '1a005a96fdd51900b5609e011c697b2588490316080f642724ed18b187dfc5e5'
  }

  /**
   * Paid the account (delegator or collator) the balance as liquid rewards.
   */
  get asV3402(): {account: Uint8Array, rewards: bigint} {
    assert(this.isV3402)
    return this._chain.decodeEvent(this.event)
  }
}
