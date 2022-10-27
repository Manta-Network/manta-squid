import type {Result} from './support'

export type BalanceStatus = BalanceStatus_Free | BalanceStatus_Reserved

export interface BalanceStatus_Free {
  __kind: 'Free'
}

export interface BalanceStatus_Reserved {
  __kind: 'Reserved'
}

export interface AccountInfo {
  nonce: number
  consumers: number
  providers: number
  data: AccountData
}

export interface AccountData {
  free: bigint
  reserved: bigint
  miscFrozen: bigint
  feeFrozen: bigint
}
