import { IdentityDataSource } from '../db/data-source'
import { UserMapping } from '../db/entities/user-mapping'
import { createUser, findUserById } from '../ocis-api'
import { OcisUser, UserPayload } from '../types'

export const findOrCreateOcisUser = async (user: UserPayload): Promise<OcisUser> => {
  let creatorIdentity = await IdentityDataSource.manager.findOneBy(UserMapping, { userId: user.id })

  let ocisUser: OcisUser

  if (!creatorIdentity) {
    ocisUser = await createUser(user)
    creatorIdentity = new UserMapping(user.id, ocisUser.id)
    await IdentityDataSource.manager.save(creatorIdentity)
  } else {
    ocisUser = await findUserById(creatorIdentity.ocisUserId)
  }

  return ocisUser
}
