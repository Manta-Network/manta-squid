import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Session} from "./session.model"

@Entity_()
export class Block {
  constructor(props?: Partial<Block>) {
    Object.assign(this, props)
  }

  /**
   * network:blockNumber
   */
  @PrimaryColumn_()
  id!: string

  @Column_("text", {nullable: false})
  network!: string

  @Column_("timestamp with time zone", {nullable: false})
  date!: Date

  @Column_("text", {nullable: false})
  authorAddressSS58!: string

  @Index_()
  @ManyToOne_(() => Session, {nullable: false})
  partOfSession!: Session
}
