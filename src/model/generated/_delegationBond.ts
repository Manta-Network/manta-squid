import assert from "assert"
import * as marshal from "./marshal"

export class DelegationBond {
  private _owner!: string
  private _amount!: bigint

  constructor(props?: Partial<Omit<DelegationBond, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._owner = marshal.string.fromJSON(json.owner)
      this._amount = marshal.bigint.fromJSON(json.amount)
    }
  }

  get owner(): string {
    assert(this._owner != null, 'uninitialized access')
    return this._owner
  }

  set owner(value: string) {
    this._owner = value
  }

  get amount(): bigint {
    assert(this._amount != null, 'uninitialized access')
    return this._amount
  }

  set amount(value: bigint) {
    this._amount = value
  }

  toJSON(): object {
    return {
      owner: this.owner,
      amount: marshal.bigint.toJSON(this.amount),
    }
  }
}
