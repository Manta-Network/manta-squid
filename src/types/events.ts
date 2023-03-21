import assert from 'assert'
import {Chain, ChainContext, EventContext, Event, Result, Option} from './support'
import * as v4010 from './v4010'

export class MantaPayPrivateTransferEvent {
    private readonly _chain: Chain
    private readonly event: Event

    constructor(ctx: EventContext)
    constructor(ctx: ChainContext, event: Event)
    constructor(ctx: EventContext, event?: Event) {
        event = event || ctx.event
        assert(event.name === 'MantaPay.PrivateTransfer')
        this._chain = ctx._chain
        this.event = event
    }

    /**
     * Private Transfer Event
     */
    get isV4010(): boolean {
        return this._chain.getEventHash('MantaPay.PrivateTransfer') === 'ca987022f754c65252ff4e6f57644fa6c0770bf3ed1fcad8067fe5005983307b'
    }

    /**
     * Private Transfer Event
     */
    get asV4010(): {origin: (Uint8Array | undefined)} {
        assert(this.isV4010)
        return this._chain.decodeEvent(this.event)
    }
}

export class MantaPayToPrivateEvent {
    private readonly _chain: Chain
    private readonly event: Event

    constructor(ctx: EventContext)
    constructor(ctx: ChainContext, event: Event)
    constructor(ctx: EventContext, event?: Event) {
        event = event || ctx.event
        assert(event.name === 'MantaPay.ToPrivate')
        this._chain = ctx._chain
        this.event = event
    }

    /**
     * To Private Event
     */
    get isV4010(): boolean {
        return this._chain.getEventHash('MantaPay.ToPrivate') === '84ff774e1f80d8a369b7c4e33922254632611e59d1217604cf1996ddac3dd324'
    }

    /**
     * To Private Event
     */
    get asV4010(): {asset: v4010.Asset, source: Uint8Array} {
        assert(this.isV4010)
        return this._chain.decodeEvent(this.event)
    }
}

export class MantaPayToPublicEvent {
    private readonly _chain: Chain
    private readonly event: Event

    constructor(ctx: EventContext)
    constructor(ctx: ChainContext, event: Event)
    constructor(ctx: EventContext, event?: Event) {
        event = event || ctx.event
        assert(event.name === 'MantaPay.ToPublic')
        this._chain = ctx._chain
        this.event = event
    }

    /**
     * To Public Event
     */
    get isV4010(): boolean {
        return this._chain.getEventHash('MantaPay.ToPublic') === '02ddc8ed4de5485f51712eaf4c7c7b7980120894154b17095f6bf37be70e2bd2'
    }

    /**
     * To Public Event
     */
    get asV4010(): {asset: v4010.Asset, sink: Uint8Array} {
        assert(this.isV4010)
        return this._chain.decodeEvent(this.event)
    }
}
