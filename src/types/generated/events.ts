import assert from "assert";
import { Chain, ChainContext, EventContext, Event, Result } from "./support";
import * as v1 from "./v1";
import * as v3110 from "./v3110";

export class BalancesBalanceSetEvent {
  private readonly _chain: Chain;
  private readonly event: Event;

  constructor(ctx: EventContext);
  constructor(ctx: ChainContext, event: Event);
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event;
    assert(event.name === "Balances.BalanceSet");
    this._chain = ctx._chain;
    this.event = event;
  }

  /**
   *  A balance was set by root. \[who, free, reserved\]
   */
  get isV1(): boolean {
    return (
      this._chain.getEventHash("Balances.BalanceSet") ===
      "0f263bfdefa394edfb38d20d33662423a2e0902235b599f9b2b0292f157f0902"
    );
  }

  /**
   *  A balance was set by root. \[who, free, reserved\]
   */
  get asV1(): [Uint8Array, bigint, bigint] {
    assert(this.isV1);
    return this._chain.decodeEvent(this.event);
  }

  /**
   * A balance was set by root.
   */
  get isV3110(): boolean {
    return (
      this._chain.getEventHash("Balances.BalanceSet") ===
      "1e2b5d5a07046e6d6e5507661d3f3feaddfb41fc609a2336b24957322080ca77"
    );
  }

  /**
   * A balance was set by root.
   */
  get asV3110(): { who: Uint8Array; free: bigint; reserved: bigint } {
    assert(this.isV3110);
    return this._chain.decodeEvent(this.event);
  }
}

export class BalancesDepositEvent {
  private readonly _chain: Chain;
  private readonly event: Event;

  constructor(ctx: EventContext);
  constructor(ctx: ChainContext, event: Event);
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event;
    assert(event.name === "Balances.Deposit");
    this._chain = ctx._chain;
    this.event = event;
  }

  /**
   *  Some amount was deposited (e.g. for transaction fees). \[who, deposit\]
   */
  get isV1(): boolean {
    return (
      this._chain.getEventHash("Balances.Deposit") ===
      "23bebce4ca9ed37548947d07d4dc50e772f07401b9a416b6aa2f3e9cb5adcaf4"
    );
  }

  /**
   *  Some amount was deposited (e.g. for transaction fees). \[who, deposit\]
   */
  get asV1(): [Uint8Array, bigint] {
    assert(this.isV1);
    return this._chain.decodeEvent(this.event);
  }

  /**
   * Some amount was deposited (e.g. for transaction fees).
   */
  get isV3110(): boolean {
    return (
      this._chain.getEventHash("Balances.Deposit") ===
      "e84a34a6a3d577b31f16557bd304282f4fe4cbd7115377f4687635dc48e52ba5"
    );
  }

  /**
   * Some amount was deposited (e.g. for transaction fees).
   */
  get asV3110(): { who: Uint8Array; amount: bigint } {
    assert(this.isV3110);
    return this._chain.decodeEvent(this.event);
  }
}

export class BalancesEndowedEvent {
  private readonly _chain: Chain;
  private readonly event: Event;

  constructor(ctx: EventContext);
  constructor(ctx: ChainContext, event: Event);
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event;
    assert(event.name === "Balances.Endowed");
    this._chain = ctx._chain;
    this.event = event;
  }

  /**
   *  An account was created with some free balance. \[account, free_balance\]
   */
  get isV1(): boolean {
    return (
      this._chain.getEventHash("Balances.Endowed") ===
      "23bebce4ca9ed37548947d07d4dc50e772f07401b9a416b6aa2f3e9cb5adcaf4"
    );
  }

  /**
   *  An account was created with some free balance. \[account, free_balance\]
   */
  get asV1(): [Uint8Array, bigint] {
    assert(this.isV1);
    return this._chain.decodeEvent(this.event);
  }

  /**
   * An account was created with some free balance.
   */
  get isV3110(): boolean {
    return (
      this._chain.getEventHash("Balances.Endowed") ===
      "75951f685df19cbb5fdda09cf928a105518ceca9576d95bd18d4fac8802730ca"
    );
  }

  /**
   * An account was created with some free balance.
   */
  get asV3110(): { account: Uint8Array; freeBalance: bigint } {
    assert(this.isV3110);
    return this._chain.decodeEvent(this.event);
  }
}

export class BalancesReserveRepatriatedEvent {
  private readonly _chain: Chain;
  private readonly event: Event;

  constructor(ctx: EventContext);
  constructor(ctx: ChainContext, event: Event);
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event;
    assert(event.name === "Balances.ReserveRepatriated");
    this._chain = ctx._chain;
    this.event = event;
  }

  /**
   *  Some balance was moved from the reserve of the first account to the second account.
   *  Final argument indicates the destination balance type.
   *  \[from, to, balance, destination_status\]
   */
  get isV1(): boolean {
    return (
      this._chain.getEventHash("Balances.ReserveRepatriated") ===
      "68e9ec5664c8ffe977da0c890bac43122a5cf13565c1c936e2120ba4980bcf31"
    );
  }

  /**
   *  Some balance was moved from the reserve of the first account to the second account.
   *  Final argument indicates the destination balance type.
   *  \[from, to, balance, destination_status\]
   */
  get asV1(): [Uint8Array, Uint8Array, bigint, v1.BalanceStatus] {
    assert(this.isV1);
    return this._chain.decodeEvent(this.event);
  }

  /**
   * Some balance was moved from the reserve of the first account to the second account.
   * Final argument indicates the destination balance type.
   */
  get isV3110(): boolean {
    return (
      this._chain.getEventHash("Balances.ReserveRepatriated") ===
      "6232d50d422cea3a6fd21da36387df36d1d366405d0c589566c6de85c9cf541f"
    );
  }

  /**
   * Some balance was moved from the reserve of the first account to the second account.
   * Final argument indicates the destination balance type.
   */
  get asV3110(): {
    from: Uint8Array;
    to: Uint8Array;
    amount: bigint;
    destinationStatus: v3110.BalanceStatus;
  } {
    assert(this.isV3110);
    return this._chain.decodeEvent(this.event);
  }
}

export class BalancesReservedEvent {
  private readonly _chain: Chain;
  private readonly event: Event;

  constructor(ctx: EventContext);
  constructor(ctx: ChainContext, event: Event);
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event;
    assert(event.name === "Balances.Reserved");
    this._chain = ctx._chain;
    this.event = event;
  }

  /**
   *  Some balance was reserved (moved from free to reserved). \[who, value\]
   */
  get isV1(): boolean {
    return (
      this._chain.getEventHash("Balances.Reserved") ===
      "23bebce4ca9ed37548947d07d4dc50e772f07401b9a416b6aa2f3e9cb5adcaf4"
    );
  }

  /**
   *  Some balance was reserved (moved from free to reserved). \[who, value\]
   */
  get asV1(): [Uint8Array, bigint] {
    assert(this.isV1);
    return this._chain.decodeEvent(this.event);
  }

  /**
   * Some balance was reserved (moved from free to reserved).
   */
  get isV3110(): boolean {
    return (
      this._chain.getEventHash("Balances.Reserved") ===
      "e84a34a6a3d577b31f16557bd304282f4fe4cbd7115377f4687635dc48e52ba5"
    );
  }

  /**
   * Some balance was reserved (moved from free to reserved).
   */
  get asV3110(): { who: Uint8Array; amount: bigint } {
    assert(this.isV3110);
    return this._chain.decodeEvent(this.event);
  }
}

export class BalancesSlashedEvent {
  private readonly _chain: Chain;
  private readonly event: Event;

  constructor(ctx: EventContext);
  constructor(ctx: ChainContext, event: Event);
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event;
    assert(event.name === "Balances.Slashed");
    this._chain = ctx._chain;
    this.event = event;
  }

  /**
   * Some amount was removed from the account (e.g. for misbehavior). \[who,
   * amount_slashed\]
   */
  get isV3100(): boolean {
    return (
      this._chain.getEventHash("Balances.Slashed") ===
      "23bebce4ca9ed37548947d07d4dc50e772f07401b9a416b6aa2f3e9cb5adcaf4"
    );
  }

  /**
   * Some amount was removed from the account (e.g. for misbehavior). \[who,
   * amount_slashed\]
   */
  get asV3100(): [Uint8Array, bigint] {
    assert(this.isV3100);
    return this._chain.decodeEvent(this.event);
  }

  /**
   * Some amount was removed from the account (e.g. for misbehavior).
   */
  get isV3110(): boolean {
    return (
      this._chain.getEventHash("Balances.Slashed") ===
      "e84a34a6a3d577b31f16557bd304282f4fe4cbd7115377f4687635dc48e52ba5"
    );
  }

  /**
   * Some amount was removed from the account (e.g. for misbehavior).
   */
  get asV3110(): { who: Uint8Array; amount: bigint } {
    assert(this.isV3110);
    return this._chain.decodeEvent(this.event);
  }
}

export class BalancesTransferEvent {
  private readonly _chain: Chain;
  private readonly event: Event;

  constructor(ctx: EventContext);
  constructor(ctx: ChainContext, event: Event);
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event;
    assert(event.name === "Balances.Transfer");
    this._chain = ctx._chain;
    this.event = event;
  }

  /**
   *  Transfer succeeded. \[from, to, value\]
   */
  get isV1(): boolean {
    return (
      this._chain.getEventHash("Balances.Transfer") ===
      "dad2bcdca357505fa3c7832085d0db53ce6f902bd9f5b52823ee8791d351872c"
    );
  }

  /**
   *  Transfer succeeded. \[from, to, value\]
   */
  get asV1(): [Uint8Array, Uint8Array, bigint] {
    assert(this.isV1);
    return this._chain.decodeEvent(this.event);
  }

  /**
   * Transfer succeeded.
   */
  get isV3110(): boolean {
    return (
      this._chain.getEventHash("Balances.Transfer") ===
      "0ffdf35c495114c2d42a8bf6c241483fd5334ca0198662e14480ad040f1e3a66"
    );
  }

  /**
   * Transfer succeeded.
   */
  get asV3110(): { from: Uint8Array; to: Uint8Array; amount: bigint } {
    assert(this.isV3110);
    return this._chain.decodeEvent(this.event);
  }
}

export class BalancesUnreservedEvent {
  private readonly _chain: Chain;
  private readonly event: Event;

  constructor(ctx: EventContext);
  constructor(ctx: ChainContext, event: Event);
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event;
    assert(event.name === "Balances.Unreserved");
    this._chain = ctx._chain;
    this.event = event;
  }

  /**
   *  Some balance was unreserved (moved from reserved to free). \[who, value\]
   */
  get isV1(): boolean {
    return (
      this._chain.getEventHash("Balances.Unreserved") ===
      "23bebce4ca9ed37548947d07d4dc50e772f07401b9a416b6aa2f3e9cb5adcaf4"
    );
  }

  /**
   *  Some balance was unreserved (moved from reserved to free). \[who, value\]
   */
  get asV1(): [Uint8Array, bigint] {
    assert(this.isV1);
    return this._chain.decodeEvent(this.event);
  }

  /**
   * Some balance was unreserved (moved from reserved to free).
   */
  get isV3110(): boolean {
    return (
      this._chain.getEventHash("Balances.Unreserved") ===
      "e84a34a6a3d577b31f16557bd304282f4fe4cbd7115377f4687635dc48e52ba5"
    );
  }

  /**
   * Some balance was unreserved (moved from reserved to free).
   */
  get asV3110(): { who: Uint8Array; amount: bigint } {
    assert(this.isV3110);
    return this._chain.decodeEvent(this.event);
  }
}

export class BalancesWithdrawEvent {
  private readonly _chain: Chain;
  private readonly event: Event;

  constructor(ctx: EventContext);
  constructor(ctx: ChainContext, event: Event);
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event;
    assert(event.name === "Balances.Withdraw");
    this._chain = ctx._chain;
    this.event = event;
  }

  /**
   * Some amount was withdrawn from the account (e.g. for transaction fees). \[who, value\]
   */
  get isV3100(): boolean {
    return (
      this._chain.getEventHash("Balances.Withdraw") ===
      "23bebce4ca9ed37548947d07d4dc50e772f07401b9a416b6aa2f3e9cb5adcaf4"
    );
  }

  /**
   * Some amount was withdrawn from the account (e.g. for transaction fees). \[who, value\]
   */
  get asV3100(): [Uint8Array, bigint] {
    assert(this.isV3100);
    return this._chain.decodeEvent(this.event);
  }

  /**
   * Some amount was withdrawn from the account (e.g. for transaction fees).
   */
  get isV3110(): boolean {
    return (
      this._chain.getEventHash("Balances.Withdraw") ===
      "e84a34a6a3d577b31f16557bd304282f4fe4cbd7115377f4687635dc48e52ba5"
    );
  }

  /**
   * Some amount was withdrawn from the account (e.g. for transaction fees).
   */
  get asV3110(): { who: Uint8Array; amount: bigint } {
    assert(this.isV3110);
    return this._chain.decodeEvent(this.event);
  }
}
