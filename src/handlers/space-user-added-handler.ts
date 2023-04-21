import { SpaceMappingRepository } from '../db'
import { logPhase, logger } from '../logger'
import { findSpaceById, shareSpaceWithUser } from '../ocis-api'
import { OcisRole, SpaceUserAddedDataPayload } from '../types'
import { findOrCreateOcisUser } from './helpers'

//Handles the SpaceUserAdded event from Google Cloud Pub/Sub.
export const spaceUserAddedHandler = async (messageId: string, payload: SpaceUserAddedDataPayload): Promise<void> => {
  try {
    const { user, space } = payload

    const ocisUser = await logPhase(messageId, 'spaceUserAddedHandler.findOrCreateOcisUser')(() => findOrCreateOcisUser(user))

    //Finds space in oCIS based on the space information in the event payload
    const spaceMappingRepository = new SpaceMappingRepository()
    const spaceIdentity = await logPhase(
      messageId,
      'spaceMappingRepository.findBySpaceId'
    )(() => spaceMappingRepository.findBySpaceId(space.id))
    const ocisSpace = await logPhase(messageId, 'spaceUserAddedHandler.findSpaceById')(() => findSpaceById(spaceIdentity.ocis_space_id))

    //Shares the space with the user with the "editor" role
    await logPhase(messageId, 'spaceUserAddedHandler.shareSpaceWithUser')(() => shareSpaceWithUser(ocisSpace.id, ocisUser.onPremisesSamAccountName, OcisRole.EDITOR))
    logger.debug('User added to space successfully', { ocisUser, ocisSpace })
  } catch (error) {
    throw new Error(`Failed to add user to space ${error}`)
  }
}
