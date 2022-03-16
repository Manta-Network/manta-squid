import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
import {SubstrateGovernanceAccount} from "./substrateGovernanceAccount.model"
import {ProposalState} from "./_proposalState"
import {SubstrateNetwork} from "./_substrateNetwork"
import {SubstrateTechcommVote} from "./substrateTechcommVote.model"

@Entity_()
export class SubstrateTechcommProposal {
  constructor(props?: Partial<SubstrateTechcommProposal>) {
    Object.assign(this, props)
  }

  /**
   * network:proposal_index
   */
  @PrimaryColumn_()
  id!: string

  @Index_()
  @Column_("text", {nullable: false})
  proposal!: string

  @Index_()
  @ManyToOne_(() => SubstrateGovernanceAccount, {nullable: false})
  proposer!: SubstrateGovernanceAccount

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  introducedAtBlock!: bigint

  @Column_("timestamp with time zone", {nullable: false})
  date!: Date

  @Column_("varchar", {length: 11, nullable: false})
  state!: ProposalState

  @Column_("varchar", {length: 8, nullable: false})
  network!: SubstrateNetwork

  @Column_("integer", {nullable: false})
  ayes!: number

  @Column_("integer", {nullable: false})
  nays!: number

  @Column_("integer", {nullable: false})
  voteCount!: number

  @Column_("integer", {nullable: false})
  voteThreshold!: number

  @OneToMany_(() => SubstrateTechcommVote, e => e.proposal)
  votes!: SubstrateTechcommVote[]
}
