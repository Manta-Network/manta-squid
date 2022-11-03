import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"
import {Bond} from "./_bond"

@Entity_()
export class DelagatorAccount {
  constructor(props?: Partial<DelagatorAccount>) {
    Object.assign(this, props)
  }

  /**
   * Account address
   */
  @PrimaryColumn_()
  id!: string

  @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.map((val: any) => val.toJSON()), from: obj => obj == null ? undefined : marshal.fromList(obj, val => new Bond(undefined, marshal.nonNull(val)))}, nullable: true})
  delegations!: (Bond)[] | undefined | null

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  totalStaked!: bigint

  @Column_("text", {nullable: false})
  status!: string
}
