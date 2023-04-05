import { SpaceMappingRepository } from '../db'
import { logger } from '../logger'
import { findSpaceById, shareSpaceWithUser } from '../ocis-api'
import { OcisRole, SpaceUserAddedDataPayload } from '../types'
import { findOrCreateOcisUser } from './helpers'

//Handles the SpaceUserAdded event from Google Cloud Pub/Sub.
export const spaceUserAddedHandler = async (payload: SpaceUserAddedDataPayload) => {
  try {
    const { user, space } = payload

    const ocisUser = await findOrCreateOcisUser(user)

    //Finds space in oCIS based on the space information in the event payload
    const spaceMappingRepository = new SpaceMappingRepository()
    const spaceIdentity = await spaceMappingRepository.findBySpaceId(space.id)
    const ocisSpace = await findSpaceById(spaceIdentity.ocis_space_id)

    //Shares the space with the user with the "editor" role
    await shareSpaceWithUser(ocisSpace.id, ocisUser.onPremisesSamAccountName, OcisRole.EDITOR)
    logger.info('User added to space successfully', { ocisUser, ocisSpace })
  } catch (error) {
    throw new Error('Failed to add user to space')
  }
}
