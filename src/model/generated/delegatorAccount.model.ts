import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"
import {DelegationBond} from "./_delegationBond"

@Entity_()
export class DelegatorAccount {
    constructor(props?: Partial<DelegatorAccount>) {
        Object.assign(this, props)
    }

    /**
     * Account address
     */
    @PrimaryColumn_()
    id!: string

    @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.map((val: any) => val.toJSON()), from: obj => obj == null ? undefined : marshal.fromList(obj, val => new DelegationBond(undefined, marshal.nonNull(val)))}, nullable: true})
    delegations!: (DelegationBond)[] | undefined | null

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    totalStaked!: bigint

    @Column_("int4", {nullable: false})
    updatedAtBlock!: number
}
