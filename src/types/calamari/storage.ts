import assert from 'assert'
import {StorageContext, Result} from './support'

export class SessionCurrentIndexStorage {
  constructor(private ctx: StorageContext) {}

  /**
   *  Current index of the session.
   */
  get isV1() {
    return this.ctx._chain.getStorageItemTypeHash('Session', 'CurrentIndex') === '81bbbe8e62451cbcc227306706c919527aa2538970bd6d67a9969dd52c257d02'
  }

  /**
   *  Current index of the session.
   */
  async getAsV1(): Promise<number> {
    assert(this.isV1)
    return this.ctx._chain.getStorage(this.ctx.block.hash, 'Session', 'CurrentIndex')
  }

  /**
   * Checks whether the storage item is defined for the current chain version.
   */
  get isExists(): boolean {
    return this.ctx._chain.getStorageItemTypeHash('Session', 'CurrentIndex') != null
  }
}

export class SessionValidatorsStorage {
  constructor(private ctx: StorageContext) {}

  /**
   *  The current set of validators.
   */
  get isV1() {
    return this.ctx._chain.getStorageItemTypeHash('Session', 'Validators') === 'f5df25eadcdffaa0d2a68b199d671d3921ca36a7b70d22d57506dca52b4b5895'
  }

  /**
   *  The current set of validators.
   */
  async getAsV1(): Promise<Uint8Array[]> {
    assert(this.isV1)
    return this.ctx._chain.getStorage(this.ctx.block.hash, 'Session', 'Validators')
  }

  /**
   * Checks whether the storage item is defined for the current chain version.
   */
  get isExists(): boolean {
    return this.ctx._chain.getStorageItemTypeHash('Session', 'Validators') != null
  }
}
