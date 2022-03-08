import assert from 'assert'
import {EventContext, Result, deprecateLatest} from './support'
import * as v3110 from './v3110'
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
