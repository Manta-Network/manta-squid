import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_} from "typeorm"
import {Block} from "./block.model"

@Entity_()
export class Session {
  constructor(props?: Partial<Session>) {
    Object.assign(this, props)
  }

  /**
   * network:session_index
   */
  @PrimaryColumn_()
  id!: string

  @Column_("text", {nullable: false})
  type!: string

  @Column_("text", {nullable: false})
  network!: string

  @Column_("integer", {nullable: false})
  sessionIndex!: number

  @Column_("timestamp with time zone", {nullable: false})
  startedAt!: Date

  @Column_("timestamp with time zone", {nullable: true})
  endedAt!: Date | undefined | null

  @OneToMany_(() => Block, e => e.partOfSession)
  blocks!: Block[]

  @Column_("text", {array: true, nullable: false})
  activeValidators!: (string | undefined | null)[]
}
