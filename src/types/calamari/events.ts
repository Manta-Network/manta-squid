import assert from 'assert'
import {EventContext, Result, deprecateLatest} from './support'
import * as v3110 from './v3110'
import * as v3140 from './v3140'
import * as v4 from './v4'

export class BalancesTransferEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'balances.Transfer')
  }

  /**
   *  Transfer succeeded. \[from, to, value\]
   */
  get isV1(): boolean {
    return this.ctx._chain.getEventHash('balances.Transfer') === '9611bd6b933331f197e8fa73bac36184681838292120987fec97092ae037d1c8'
  }

  /**
   *  Transfer succeeded. \[from, to, value\]
   */
  get asV1(): [Uint8Array, Uint8Array, bigint] {
    assert(this.isV1)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Transfer succeeded.
   */
  get isV3110(): boolean {
    return this.ctx._chain.getEventHash('balances.Transfer') === '99bc4786247456e0d4a44373efe405e598bfadfac87a7c41b0a82a91296836c1'
  }

  /**
   * Transfer succeeded.
   */
  get asV3110(): {from: v3110.AccountId32, to: v3110.AccountId32, amount: bigint} {
    assert(this.isV3110)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV3110
  }

  get asLatest(): {from: v3110.AccountId32, to: v3110.AccountId32, amount: bigint} {
    deprecateLatest()
    return this.asV3110
  }
}

export class DemocracyProposedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'democracy.Proposed')
  }

  /**
   * A motion has been proposed by a public account. \[proposal_index, deposit\]
   */
  get isV4(): boolean {
    return this.ctx._chain.getEventHash('democracy.Proposed') === 'ec9d8411ccb58c13acecb12c4b4103b429f06983b49e7443b80c83975cb484ed'
  }

  /**
   * A motion has been proposed by a public account. \[proposal_index, deposit\]
   */
  get asV4(): [number, bigint] {
    assert(this.isV4)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * A motion has been proposed by a public account.
   */
  get isV3110(): boolean {
    return this.ctx._chain.getEventHash('democracy.Proposed') === '52a3fc64bce50a0f796295d5997106abe75022e8260b5b12503c89b205774e0d'
  }

  /**
   * A motion has been proposed by a public account.
   */
  get asV3110(): {proposalIndex: number, deposit: bigint} {
    assert(this.isV3110)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV3110
  }

  get asLatest(): {proposalIndex: number, deposit: bigint} {
    deprecateLatest()
    return this.asV3110
  }
}

export class DemocracyStartedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'democracy.Started')
  }

  /**
   * A referendum has begun. \[ref_index, threshold\]
   */
  get isV4(): boolean {
    return this.ctx._chain.getEventHash('democracy.Started') === '8d2e3ee24efda41975164e8978c8d4bd4db323c948fca6fc2185f7dbd5187279'
  }

  /**
   * A referendum has begun. \[ref_index, threshold\]
   */
  get asV4(): [number, v4.VoteThreshold] {
    assert(this.isV4)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * A referendum has begun.
   */
  get isV3110(): boolean {
    return this.ctx._chain.getEventHash('democracy.Started') === '7eddfd695fafebc9154f63d976aa98302dc7e2a7f64342b386cb0ddf84367abd'
  }

  /**
   * A referendum has begun.
   */
  get asV3110(): {refIndex: number, threshold: v3110.VoteThreshold} {
    assert(this.isV3110)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV3110
  }

  get asLatest(): {refIndex: number, threshold: v3110.VoteThreshold} {
    deprecateLatest()
    return this.asV3110
  }
}

export class TechnicalCommitteeApprovedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'technicalCommittee.Approved')
  }

  /**
   * A motion was approved by the required threshold.
   * \[proposal_hash\]
   */
  get isV4(): boolean {
    return this.ctx._chain.getEventHash('technicalCommittee.Approved') === '4dcb738dfd74af66592bf0d341fc294420f303748854437f4fb19a25e1e3b969'
  }

  /**
   * A motion was approved by the required threshold.
   * \[proposal_hash\]
   */
  get asV4(): v4.H256 {
    assert(this.isV4)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * A motion was approved by the required threshold.
   */
  get isV3110(): boolean {
    return this.ctx._chain.getEventHash('technicalCommittee.Approved') === 'eaf32ea95efc256e36465c8e91c12640de467820469adbe62abb99fb96683a1d'
  }

  /**
   * A motion was approved by the required threshold.
   */
  get asV3110(): {proposalHash: v3110.H256} {
    assert(this.isV3110)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV3110
  }

  get asLatest(): {proposalHash: v3110.H256} {
    deprecateLatest()
    return this.asV3110
  }
}

export class TechnicalCommitteeClosedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'technicalCommittee.Closed')
  }

  /**
   * A proposal was closed because its threshold was reached or after its duration was up.
   * \[proposal_hash, yes, no\]
   */
  get isV4(): boolean {
    return this.ctx._chain.getEventHash('technicalCommittee.Closed') === 'cc2a7a195200ff1765156f1e492d2584a29bc752afb3aaa18fb7cfe1e8a666fd'
  }

  /**
   * A proposal was closed because its threshold was reached or after its duration was up.
   * \[proposal_hash, yes, no\]
   */
  get asV4(): [v4.H256, number, number] {
    assert(this.isV4)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * A proposal was closed because its threshold was reached or after its duration was up.
   */
  get isV3110(): boolean {
    return this.ctx._chain.getEventHash('technicalCommittee.Closed') === '5b4e2a78c65eaf1dc9455f9827c6928d2754177fa61a354615b5ae5ac4335607'
  }

  /**
   * A proposal was closed because its threshold was reached or after its duration was up.
   */
  get asV3110(): {proposalHash: v3110.H256, yes: number, no: number} {
    assert(this.isV3110)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV3110
  }

  get asLatest(): {proposalHash: v3110.H256, yes: number, no: number} {
    deprecateLatest()
    return this.asV3110
  }
}

export class TechnicalCommitteeDisapprovedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'technicalCommittee.Disapproved')
  }

  /**
   * A motion was not approved by the required threshold.
   * \[proposal_hash\]
   */
  get isV4(): boolean {
    return this.ctx._chain.getEventHash('technicalCommittee.Disapproved') === '31cbd254685f7a5677bbe134ea4e0be1295f228d56b6d660c28cf62bf7302420'
  }

  /**
   * A motion was not approved by the required threshold.
   * \[proposal_hash\]
   */
  get asV4(): v4.H256 {
    assert(this.isV4)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * A motion was not approved by the required threshold.
   */
  get isV3110(): boolean {
    return this.ctx._chain.getEventHash('technicalCommittee.Disapproved') === '596de332a7071aaafc2578d06c01734ac75eb26956b489e50950ba15a2edba2d'
  }

  /**
   * A motion was not approved by the required threshold.
   */
  get asV3110(): {proposalHash: v3110.H256} {
    assert(this.isV3110)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV3110
  }

  get asLatest(): {proposalHash: v3110.H256} {
    deprecateLatest()
    return this.asV3110
  }
}

export class TechnicalCommitteeExecutedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'technicalCommittee.Executed')
  }

  /**
   * A motion was executed; result will be `Ok` if it returned without error.
   * \[proposal_hash, result\]
   */
  get isV4(): boolean {
    return this.ctx._chain.getEventHash('technicalCommittee.Executed') === '22cc7fe5e78223cb056f3fcdb659825eb15569c7b66df7ddc32b89bbbee81dd1'
  }

  /**
   * A motion was executed; result will be `Ok` if it returned without error.
   * \[proposal_hash, result\]
   */
  get asV4(): [v4.H256, Result<null, v4.DispatchError>] {
    assert(this.isV4)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * A motion was executed; result will be `Ok` if it returned without error.
   */
  get isV3110(): boolean {
    return this.ctx._chain.getEventHash('technicalCommittee.Executed') === '2089bfe6311bd1605ab28185553ed77b7e4fb48785ba141c96708796d378804f'
  }

  /**
   * A motion was executed; result will be `Ok` if it returned without error.
   */
  get asV3110(): {proposalHash: v3110.H256, result: Result<null, v3110.DispatchError>} {
    assert(this.isV3110)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * A motion was executed; result will be `Ok` if it returned without error.
   */
  get isV3140(): boolean {
    return this.ctx._chain.getEventHash('technicalCommittee.Executed') === 'ba02bc587b6063a34ef8636af23ff0695d6d131bc8a9effebf971eda9bf8f75c'
  }

  /**
   * A motion was executed; result will be `Ok` if it returned without error.
   */
  get asV3140(): {proposalHash: v3140.H256, result: Result<null, v3140.DispatchError>} {
    assert(this.isV3140)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV3140
  }

  get asLatest(): {proposalHash: v3140.H256, result: Result<null, v3140.DispatchError>} {
    deprecateLatest()
    return this.asV3140
  }
}

export class TechnicalCommitteeMemberExecutedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'technicalCommittee.MemberExecuted')
  }

  /**
   * A single member did some action; result will be `Ok` if it returned without error.
   * \[proposal_hash, result\]
   */
  get isV4(): boolean {
    return this.ctx._chain.getEventHash('technicalCommittee.MemberExecuted') === '0f7418bf08e9db768b31ed6a0b9b12d1dd2976b0b419bc8e6f9cf7485dcdb6b5'
  }

  /**
   * A single member did some action; result will be `Ok` if it returned without error.
   * \[proposal_hash, result\]
   */
  get asV4(): [v4.H256, Result<null, v4.DispatchError>] {
    assert(this.isV4)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * A single member did some action; result will be `Ok` if it returned without error.
   */
  get isV3110(): boolean {
    return this.ctx._chain.getEventHash('technicalCommittee.MemberExecuted') === '9cec0be7a91dd6d48bc722d555a8c1f2276bca075745fffc87b4a19b1ba57390'
  }

  /**
   * A single member did some action; result will be `Ok` if it returned without error.
   */
  get asV3110(): {proposalHash: v3110.H256, result: Result<null, v3110.DispatchError>} {
    assert(this.isV3110)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * A single member did some action; result will be `Ok` if it returned without error.
   */
  get isV3140(): boolean {
    return this.ctx._chain.getEventHash('technicalCommittee.MemberExecuted') === '91964554c5710a2f7fe422e033bba8edbac65c500f107f916e539da73f9e16bb'
  }

  /**
   * A single member did some action; result will be `Ok` if it returned without error.
   */
  get asV3140(): {proposalHash: v3140.H256, result: Result<null, v3140.DispatchError>} {
    assert(this.isV3140)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV3140
  }

  get asLatest(): {proposalHash: v3140.H256, result: Result<null, v3140.DispatchError>} {
    deprecateLatest()
    return this.asV3140
  }
}

export class TechnicalCommitteeProposedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'technicalCommittee.Proposed')
  }

  /**
   * A motion (given hash) has been proposed (by given account) with a threshold (given
   * `MemberCount`).
   * \[account, proposal_index, proposal_hash, threshold\]
   */
  get isV4(): boolean {
    return this.ctx._chain.getEventHash('technicalCommittee.Proposed') === 'f209c53b3afe8d2d84d5d8d65d1ef647dde6596f8ad2b3910c231e51977b79f5'
  }

  /**
   * A motion (given hash) has been proposed (by given account) with a threshold (given
   * `MemberCount`).
   * \[account, proposal_index, proposal_hash, threshold\]
   */
  get asV4(): [v4.AccountId32, number, v4.H256, number] {
    assert(this.isV4)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * A motion (given hash) has been proposed (by given account) with a threshold (given
   * `MemberCount`).
   */
  get isV3110(): boolean {
    return this.ctx._chain.getEventHash('technicalCommittee.Proposed') === '8110914ce14eda5c1cbba9cf0cb58f21301e30594fb2745b78e81993b029f52a'
  }

  /**
   * A motion (given hash) has been proposed (by given account) with a threshold (given
   * `MemberCount`).
   */
  get asV3110(): {account: v3110.AccountId32, proposalIndex: number, proposalHash: v3110.H256, threshold: number} {
    assert(this.isV3110)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV3110
  }

  get asLatest(): {account: v3110.AccountId32, proposalIndex: number, proposalHash: v3110.H256, threshold: number} {
    deprecateLatest()
    return this.asV3110
  }
}

export class TechnicalCommitteeVotedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'technicalCommittee.Voted')
  }

  /**
   * A motion (given hash) has been voted on by given account, leaving
   * a tally (yes votes and no votes given respectively as `MemberCount`).
   * \[account, proposal_hash, voted, yes, no\]
   */
  get isV4(): boolean {
    return this.ctx._chain.getEventHash('technicalCommittee.Voted') === 'e342c353e880d9dbefcb0608651534806335f848957fea9a305b3b3bc5aeb390'
  }

  /**
   * A motion (given hash) has been voted on by given account, leaving
   * a tally (yes votes and no votes given respectively as `MemberCount`).
   * \[account, proposal_hash, voted, yes, no\]
   */
  get asV4(): [v4.AccountId32, v4.H256, boolean, number, number] {
    assert(this.isV4)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * A motion (given hash) has been voted on by given account, leaving
   * a tally (yes votes and no votes given respectively as `MemberCount`).
   */
  get isV3110(): boolean {
    return this.ctx._chain.getEventHash('technicalCommittee.Voted') === '99064999c2820a12eda1075f1f5be372a6fad9c8f7eb7887365f14ed45d7d390'
  }

  /**
   * A motion (given hash) has been voted on by given account, leaving
   * a tally (yes votes and no votes given respectively as `MemberCount`).
   */
  get asV3110(): {account: v3110.AccountId32, proposalHash: v3110.H256, voted: boolean, yes: number, no: number} {
    assert(this.isV3110)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV3110
  }

  get asLatest(): {account: v3110.AccountId32, proposalHash: v3110.H256, voted: boolean, yes: number, no: number} {
    deprecateLatest()
    return this.asV3110
  }
}
