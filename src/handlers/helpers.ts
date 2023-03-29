import { IdentityDataSource } from '../db/data-source'
import { UserIdentity } from '../db/entities/user-identity'
import { createUser, findUserById } from '../ocis-api'
import { OcisUser, UserPayload } from '../types'

export const findOrCreateOcisUser = async (user: UserPayload): Promise<OcisUser> => {
  let creatorIdentity = await IdentityDataSource.manager.findOneBy(UserIdentity, { userId: user.id })

  let ocisUser: OcisUser

  if (!creatorIdentity) {
    ocisUser = await createUser(user)
    creatorIdentity = new UserIdentity(user.id, ocisUser.id)
    await IdentityDataSource.manager.save(creatorIdentity)
  } else {
    ocisUser = await findUserById(creatorIdentity.ocisUserId)
  }

  return ocisUser
}
