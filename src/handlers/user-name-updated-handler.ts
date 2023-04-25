import { logPhase, logger } from '../logger'
import { UserNameUpdatedDataPayload } from '../types'
import { updateOrCreateOcisUser } from './helpers'

//Handles UserNameUpdated event from Google Cloud Pub/Sub.
export const userNameUpdatedHandler = async (messageId: string, payload: UserNameUpdatedDataPayload): Promise<void> => {
  try {
    const { user } = payload
    const ocisUser = await logPhase(
      messageId,
      'userNameUpdatedHandler.updateOrCreateOcisUser'
    )(() => updateOrCreateOcisUser(user))
    logger.debug('User name updated successfully', { ocisUser })
  } catch (error) {
    throw new Error(`Failed to update user name ${error}`)
  }
}
