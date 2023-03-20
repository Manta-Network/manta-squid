import assert from "assert"
import * as marshal from "./marshal"

export class Asset {
    private _id!: string
    private _amount!: string

    constructor(props?: Partial<Omit<Asset, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._id = marshal.string.fromJSON(json.id)
            this._amount = marshal.string.fromJSON(json.amount)
        }
    }

    get id(): string {
        assert(this._id != null, 'uninitialized access')
        return this._id
    }

    set id(value: string) {
        this._id = value
    }

    get amount(): string {
        assert(this._amount != null, 'uninitialized access')
        return this._amount
    }

    set amount(value: string) {
        this._amount = value
    }

    toJSON(): object {
        return {
            id: this.id,
            amount: this.amount,
        }
    }
}
