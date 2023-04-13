import { UserMappingRepository } from '../db'
import { logger } from '../logger'
import { createUser, findUserByAccountName, findUserById } from '../ocis-api'
import { OcisUser, UserPayload } from '../types'

//Finds an existing OCIS user (i.e. either by ID or by account name) or creates a new one based on the given user payload.
export const findOrCreateOcisUser = async (user: UserPayload): Promise<OcisUser> => {
  const userMappingRepository = new UserMappingRepository()
  const userIdentity = await userMappingRepository.findByUserId(user.id)

  if (userIdentity) {
    return await findUserById(userIdentity.ocis_user_id)
  }

  let ocisUser = await findUserByAccountName(user.id)

  if (!ocisUser) {
    ocisUser = await createUser(user)
  }

  logger.debug('findOrCreateOcisUser', { ocisUser })

  await userMappingRepository.create(user.id, ocisUser.id)
  logger.debug('User created successfully', { ocisUser })

  return ocisUser
}
