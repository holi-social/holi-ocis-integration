import { UserMappingRepository } from '../db'
import { logPhase, logger } from '../logger'
import { findUserById, updateUser } from '../ocis-api'
import { UserNameUpdatedDataPayload } from '../types'

//Handles UserNameUpdated event from Google Cloud Pub/Sub.
export const userNameUpdatedHandler = async (messageId: string, payload: UserNameUpdatedDataPayload): Promise<void> => {
  try {
    const { user } = payload
    const userMappingRepository = new UserMappingRepository()
    const userIdentity = await logPhase(
      messageId,
      'userNameUpdatedHandler.userMappingRepository.findByUserIdOrFail'
    )(() => userMappingRepository.findByUserIdOrFail(user.id))
    const ocisUser = await logPhase(
      messageId,
      'userNameUpdatedHandler.findUserById'
    )(() => findUserById(userIdentity.ocis_user_id))
    const updatedOcisUser = await logPhase(
      messageId,
      'userNameUpdatedHandler.updateUser'
    )(() => updateUser(ocisUser.id, user))
    logger.debug('User name updated successfully', { updatedOcisUser })
  } catch (error) {
    throw new Error(`Failed to update user name ${error}`)
  }
}
