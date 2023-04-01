import { UserMappingRepository } from '../db'
import { createUser, findUserById } from '../ocis-api'
import { OcisUser, UserPayload } from '../types'

export const findOrCreateOcisUser = async (user: UserPayload): Promise<OcisUser> => {
  const userMappingRepository = new UserMappingRepository()
  let creatorIdentity = await userMappingRepository.findByUserId(user.id)
  let ocisUser: OcisUser

  if (!creatorIdentity) {
    ocisUser = await createUser(user)
    await userMappingRepository.create(user.id, ocisUser.id)
  } else {
    ocisUser = await findUserById(creatorIdentity.ocis_user_id)
  }

  return ocisUser
}
