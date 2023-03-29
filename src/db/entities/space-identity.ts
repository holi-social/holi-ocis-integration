import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({ name: 'space_identity' })
export class SpaceIdentity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'space_id' })
  spaceId: string

  @Column({ name: 'ocis_space_id' })
  ocisSpaceId: string

  constructor(spaceId: string, ocisSpaceId: string) {
    this.spaceId = spaceId
    this.ocisSpaceId = ocisSpaceId
  }
}
