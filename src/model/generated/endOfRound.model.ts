import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class EndOfRound {
    constructor(props?: Partial<EndOfRound>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    stakingRewards!: bigint

    @Index_()
    @Column_("int4", {nullable: false})
    roundNumber!: number

    @Index_()
    @Column_("int4", {nullable: false})
    blockNumber!: number
}
