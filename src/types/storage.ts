import assert from 'assert'
import {Block, Chain, ChainContext, BlockContext, Result} from './support'
import * as v3402 from './v3402'

export class ParachainStakingCandidateInfoStorage {
  private readonly _chain: Chain
  private readonly blockHash: string

  constructor(ctx: BlockContext)
  constructor(ctx: ChainContext, block: Block)
  constructor(ctx: BlockContext, block?: Block) {
    block = block || ctx.block
    this.blockHash = block.hash
    this._chain = ctx._chain
  }

  /**
   *  Get collator candidate info associated with an account if account is candidate else None
   */
  get isV3402() {
    return this._chain.getStorageItemTypeHash('ParachainStaking', 'CandidateInfo') === '492bae942a9c270d85b89619b756314f7f898f3d8cce98311fd5a46d4f213379'
  }

  /**
   *  Get collator candidate info associated with an account if account is candidate else None
   */
  async getAsV3402(key: Uint8Array): Promise<v3402.CandidateMetadata | undefined> {
    assert(this.isV3402)
    return this._chain.getStorage(this.blockHash, 'ParachainStaking', 'CandidateInfo', key)
  }

  async getManyAsV3402(keys: Uint8Array[]): Promise<(v3402.CandidateMetadata | undefined)[]> {
    assert(this.isV3402)
    return this._chain.queryStorage(this.blockHash, 'ParachainStaking', 'CandidateInfo', keys.map(k => [k]))
  }

  async getAllAsV3402(): Promise<(v3402.CandidateMetadata)[]> {
    assert(this.isV3402)
    return this._chain.queryStorage(this.blockHash, 'ParachainStaking', 'CandidateInfo')
  }

  /**
   * Checks whether the storage item is defined for the current chain version.
   */
  get isExists(): boolean {
    return this._chain.getStorageItemTypeHash('ParachainStaking', 'CandidateInfo') != null
  }
}

export class ParachainStakingDelegatorStateStorage {
  private readonly _chain: Chain
  private readonly blockHash: string

  constructor(ctx: BlockContext)
  constructor(ctx: ChainContext, block: Block)
  constructor(ctx: BlockContext, block?: Block) {
    block = block || ctx.block
    this.blockHash = block.hash
    this._chain = ctx._chain
  }

  /**
   *  Get delegator state associated with an account if account is delegating else None
   */
  get isV3402() {
    return this._chain.getStorageItemTypeHash('ParachainStaking', 'DelegatorState') === '6fa79ce172c27e63a5868142da60ed6770fb285e653b0980bca0ed7b7fa435be'
  }

  /**
   *  Get delegator state associated with an account if account is delegating else None
   */
  async getAsV3402(key: Uint8Array): Promise<v3402.Delegator | undefined> {
    assert(this.isV3402)
    return this._chain.getStorage(this.blockHash, 'ParachainStaking', 'DelegatorState', key)
  }

  async getManyAsV3402(keys: Uint8Array[]): Promise<(v3402.Delegator | undefined)[]> {
    assert(this.isV3402)
    return this._chain.queryStorage(this.blockHash, 'ParachainStaking', 'DelegatorState', keys.map(k => [k]))
  }

  async getAllAsV3402(): Promise<(v3402.Delegator)[]> {
    assert(this.isV3402)
    return this._chain.queryStorage(this.blockHash, 'ParachainStaking', 'DelegatorState')
  }

  /**
   * Checks whether the storage item is defined for the current chain version.
   */
  get isExists(): boolean {
    return this._chain.getStorageItemTypeHash('ParachainStaking', 'DelegatorState') != null
  }
}

export class ParachainStakingTotalStorage {
  private readonly _chain: Chain
  private readonly blockHash: string

  constructor(ctx: BlockContext)
  constructor(ctx: ChainContext, block: Block)
  constructor(ctx: BlockContext, block?: Block) {
    block = block || ctx.block
    this.blockHash = block.hash
    this._chain = ctx._chain
  }

  /**
   *  Total capital locked by this staking pallet
   */
  get isV3402() {
    return this._chain.getStorageItemTypeHash('ParachainStaking', 'Total') === 'f8ebe28eb30158172c0ccf672f7747c46a244f892d08ef2ebcbaadde34a26bc0'
  }

  /**
   *  Total capital locked by this staking pallet
   */
  async getAsV3402(): Promise<bigint> {
    assert(this.isV3402)
    return this._chain.getStorage(this.blockHash, 'ParachainStaking', 'Total')
  }

  /**
   * Checks whether the storage item is defined for the current chain version.
   */
  get isExists(): boolean {
    return this._chain.getStorageItemTypeHash('ParachainStaking', 'Total') != null
  }
}
