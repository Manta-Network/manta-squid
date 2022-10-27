import assert from 'assert'
import {Block, Chain, ChainContext, BlockContext, Result} from './support'
import * as v1 from './v1'
import * as v3 from './v3'

export class BalancesTotalIssuanceStorage {
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
   *  The total units issued in the system.
   */
  get isV1() {
    return this._chain.getStorageItemTypeHash('Balances', 'TotalIssuance') === 'f8ebe28eb30158172c0ccf672f7747c46a244f892d08ef2ebcbaadde34a26bc0'
  }

  /**
   *  The total units issued in the system.
   */
  async getAsV1(): Promise<bigint> {
    assert(this.isV1)
    return this._chain.getStorage(this.blockHash, 'Balances', 'TotalIssuance')
  }

  /**
   * Checks whether the storage item is defined for the current chain version.
   */
  get isExists(): boolean {
    return this._chain.getStorageItemTypeHash('Balances', 'TotalIssuance') != null
  }
}

export class SystemAccountStorage {
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
   *  The full account information for a particular account ID.
   */
  get isV1() {
    return this._chain.getStorageItemTypeHash('System', 'Account') === '73070b537f1805475b37167271b33ac7fd6ffad8ba62da08bc14937a017b8bb2'
  }

  /**
   *  The full account information for a particular account ID.
   */
  async getAsV1(key: Uint8Array): Promise<v1.AccountInfo> {
    assert(this.isV1)
    return this._chain.getStorage(this.blockHash, 'System', 'Account', key)
  }

  async getManyAsV1(keys: Uint8Array[]): Promise<(v1.AccountInfo)[]> {
    assert(this.isV1)
    return this._chain.queryStorage(this.blockHash, 'System', 'Account', keys.map(k => [k]))
  }

  async getAllAsV1(): Promise<(v1.AccountInfo)[]> {
    assert(this.isV1)
    return this._chain.queryStorage(this.blockHash, 'System', 'Account')
  }

  /**
   *  The full account information for a particular account ID.
   */
  get isV3() {
    return this._chain.getStorageItemTypeHash('System', 'Account') === '1ddc7ade926221442c388ee4405a71c9428e548fab037445aaf4b3a78f4735c1'
  }

  /**
   *  The full account information for a particular account ID.
   */
  async getAsV3(key: Uint8Array): Promise<v3.AccountInfo> {
    assert(this.isV3)
    return this._chain.getStorage(this.blockHash, 'System', 'Account', key)
  }

  async getManyAsV3(keys: Uint8Array[]): Promise<(v3.AccountInfo)[]> {
    assert(this.isV3)
    return this._chain.queryStorage(this.blockHash, 'System', 'Account', keys.map(k => [k]))
  }

  async getAllAsV3(): Promise<(v3.AccountInfo)[]> {
    assert(this.isV3)
    return this._chain.queryStorage(this.blockHash, 'System', 'Account')
  }

  /**
   * Checks whether the storage item is defined for the current chain version.
   */
  get isExists(): boolean {
    return this._chain.getStorageItemTypeHash('System', 'Account') != null
  }
}
