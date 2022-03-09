import assert from "assert"
import * as marshal from "./marshal"
import {Account} from "./account.model"

export class Vote {
  private _voter!: string
  private _approve!: boolean

  constructor(props?: Partial<Omit<Vote, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._voter = marshal.string.fromJSON(json.voter)
      this._approve = marshal.boolean.fromJSON(json.approve)
    }
  }

  get voter(): string {
    assert(this._voter != null, 'uninitialized access')
    return this._voter
  }

  set voter(value: string) {
    this._voter = value
  }

  get approve(): boolean {
    assert(this._approve != null, 'uninitialized access')
    return this._approve
  }

  set approve(value: boolean) {
    this._approve = value
  }

  toJSON(): object {
    return {
      voter: this.voter,
      approve: this.approve,
    }
  }
}
