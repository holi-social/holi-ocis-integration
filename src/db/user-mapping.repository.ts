import db, { UserMapping } from '.'
import { logger } from '../logger'

export class UserMappingRepository {
  async findByUserId(id: string) {
    return UserMapping(db).findOne({ user_id: id })
  }

  async findByUserIdOrFail(id: string) {
    return UserMapping(db).findOneRequired({ user_id: id })
  }

  async findByOcisUserId(id: string) {
    return UserMapping(db).findOne({ ocis_user_id: id })
  }

  async create(userId: string, ocisUserId: string) {
    logger.debug('UserMappingRepository create', { userId, ocisUserId })
    return UserMapping(db).insert({ user_id: userId, ocis_user_id: ocisUserId })
  }
}
