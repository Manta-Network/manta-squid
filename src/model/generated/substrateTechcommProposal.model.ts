import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {SubstrateGovernanceAccount} from "./substrateGovernanceAccount.model"
import {Vote} from "./_vote"
import {ProposalState} from "./_proposalState"
import {SubstrateNetwork} from "./_substrateNetwork"

@Entity_()
export class SubstrateTechcommProposal {
  constructor(props?: Partial<SubstrateTechcommProposal>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("text", {nullable: false})
  proposal!: string

  @Index_()
  @ManyToOne_(() => SubstrateGovernanceAccount, {nullable: false})
  proposer!: SubstrateGovernanceAccount

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  introducedAtBlock!: bigint

  @Column_("timestamp with time zone", {nullable: false})
  date!: Date

  @Column_("integer", {nullable: false})
  threshold!: number

  @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.map((val: any) => val == null ? undefined : val.toJSON()), from: obj => obj == null ? undefined : marshal.fromList(obj, val => val == null ? undefined : new Vote(undefined, val))}, nullable: true})
  votes!: (Vote | undefined | null)[] | undefined | null

  @Column_("varchar", {length: 11, nullable: false})
  state!: ProposalState

  @Column_("varchar", {length: 8, nullable: false})
  network!: SubstrateNetwork
}
