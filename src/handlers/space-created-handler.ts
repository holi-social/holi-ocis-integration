import { IdentityDataSource } from '../db/data-source'
import { SpaceMapping } from '../db/entities/space-mapping'
import { createSpace, shareSpaceWithUser } from '../ocis-api'
import { SpaceCreatedDataPayload, OcisRole } from '../types'
import { findOrCreateOcisUser } from './helpers'

//Handles the SpaceCreated event from Google Cloud Pub/Sub.
export const spaceCreatedHandler = async (payload: SpaceCreatedDataPayload) => {
  try {
    const { creator, space } = payload

    const ocisUser = await findOrCreateOcisUser(creator)

    //Creates a new space in oCIS based on the space information in the event payload
    const ocisSpace = await createSpace(space)
    const spaceIdentity = new SpaceMapping(space.id, ocisSpace.id)
    await IdentityDataSource.manager.save(spaceIdentity)

    //Shares the new space with the user with the "manager" role
    await shareSpaceWithUser(ocisSpace.id, ocisUser.onPremisesSamAccountName, OcisRole.EDITOR)
  } catch (error) {
    throw error
  }
}
