import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class ChainState {
    constructor(props?: Partial<ChainState>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("int4", {nullable: false})
    delegatorCount!: number

    @Column_("int4", {nullable: false})
    activeCollatorCount!: number

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    totalStaked!: bigint

    @Index_()
    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date

    @Index_()
    @Column_("int4", {nullable: false})
    blockNumber!: number
}
