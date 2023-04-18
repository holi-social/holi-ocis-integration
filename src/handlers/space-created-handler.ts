import { SpaceMappingRepository } from '../db'
import { logger } from '../logger'
import { createSpace, shareSpaceWithUser } from '../ocis-api'
import { SpaceCreatedDataPayload, OcisRole } from '../types'
import { findOrCreateOcisSpace, findOrCreateOcisUser } from './helpers'

//Handles the SpaceCreated event from Google Cloud Pub/Sub.
export const spaceCreatedHandler = async (payload: SpaceCreatedDataPayload) => {
  try {
    const { creator, space } = payload

    const ocisUser = await findOrCreateOcisUser(creator)
    const ocisSpace = await findOrCreateOcisSpace(space)

    //Shares the new space with the user with the "manager" role
    await shareSpaceWithUser(ocisSpace.id, ocisUser.onPremisesSamAccountName, OcisRole.EDITOR)
  } catch (error) {
    throw new Error(`Failed to create space ${error}`)
  }
}
