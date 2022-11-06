import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class CollatorAccount {
  constructor(props?: Partial<CollatorAccount>) {
    Object.assign(this, props)
  }

  /**
   * Account address
   */
  @PrimaryColumn_()
  id!: string

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  selfBond!: bigint

  @Column_("int4", {nullable: false})
  delegationCount!: number

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  totalBond!: bigint

  @Column_("int4", {nullable: false})
  updatedAtBlock!: number
}
