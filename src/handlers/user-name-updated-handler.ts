import { UserMappingRepository } from '../db'
import { logger } from '../logger'
import { findUserById, updateUser } from '../ocis-api'
import { UserNameUpdatedDataPayload } from '../types'

//Handles UserNameUpdated event from Google Cloud Pub/Sub.
export const userNameUpdatedHandler = async (payload: UserNameUpdatedDataPayload) => {
  try {
    const { user } = payload
    const userMappingRepository = new UserMappingRepository()
    const userIdentity = await userMappingRepository.findByUserIdOrFail(user.id)
    const ocisUser = await findUserById(userIdentity.ocis_user_id)
    const updatedOcisUser = await updateUser(ocisUser.id, user)
    logger.debug('User name updated successfully', { updatedOcisUser })
  } catch (error) {
    throw new Error('Failed to update user name')
  }
}
