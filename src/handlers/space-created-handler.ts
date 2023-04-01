import { SpaceMappingRepository } from '../db'
import { logger } from '../logger'
import { createSpace, shareSpaceWithUser } from '../ocis-api'
import { SpaceCreatedDataPayload, OcisRole } from '../types'
import { findOrCreateOcisUser } from './helpers'

//Handles the SpaceCreated event from Google Cloud Pub/Sub.
export const spaceCreatedHandler = async (payload: SpaceCreatedDataPayload) => {
  try {
    const { creator, space } = payload

    const ocisUser = await findOrCreateOcisUser(creator)

    //Creates a new space in oCIS based on the space information in the event payload
    const spaceMappingRepository = new SpaceMappingRepository()
    const ocisSpace = await createSpace(space)
    await spaceMappingRepository.create(space.id, ocisSpace.id)

    //Shares the new space with the user with the "manager" role
    await shareSpaceWithUser(ocisSpace.id, ocisUser.onPremisesSamAccountName, OcisRole.EDITOR)
    logger.info('Space created successfully', { ocisSpace })
  } catch (error) {
    logger.error('Failed to create space', { payload })
    throw error
  }
}
