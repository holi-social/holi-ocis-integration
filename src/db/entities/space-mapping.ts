import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({ name: 'space_mapping' })
export class SpaceMapping {
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
