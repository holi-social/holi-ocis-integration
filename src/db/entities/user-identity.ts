import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({ name: 'user_identity' })
export class UserIdentity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'user_id' })
  userId: string

  @Column({ name: 'ocis_user_id' })
  ocisUserId: string

  constructor(userId: string, ocisUserId: string) {
    this.userId = userId
    this.ocisUserId = ocisUserId
  }
}
