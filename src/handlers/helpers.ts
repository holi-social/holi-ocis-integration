import db, { UserMapping } from '../db'
import { createUser, findUserById } from '../ocis-api'
import { OcisUser, UserPayload } from '../types'

export const findOrCreateOcisUser = async (user: UserPayload): Promise<OcisUser> => {
  let creatorIdentity = await UserMapping(db).findOne({ user_id: user.id })
  let ocisUser: OcisUser

  if (!creatorIdentity) {
    ocisUser = await createUser(user)
    await UserMapping(db).insert({ user_id: user.id, ocis_user_id: ocisUser.id })
  } else {
    ocisUser = await findUserById(creatorIdentity.ocis_user_id)
  }

  return ocisUser
}
