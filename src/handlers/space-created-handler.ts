import { IdentityDataSource } from '../db/data-source'
import { SpaceIdentity } from '../db/entities/space-identity'
import { assignUserRole, createSpace, shareSpaceWithUser } from '../ocis-api'
import { SpaceCreatedDataPayload, OcisDefaultUUIDRole, OcisRole } from '../types'
import { findOrCreateOcisUser } from './helpers'

//Handles the SpaceCreated event from Google Cloud Pub/Sub.
export const spaceCreatedHandler = async (payload: SpaceCreatedDataPayload) => {
  try {
    const { creator, space } = payload

    const ocisUser = await findOrCreateOcisUser(creator)

    //Assigns the "Space Admin" role to the user
    await assignUserRole(ocisUser.id, OcisDefaultUUIDRole.SPACE_ADMIN)

    //Creates a new space in oCIS based on the space information in the event payload
    const ocisSpace = await createSpace(space)
    const spaceIdentity = new SpaceIdentity(space.id, ocisSpace.id)
    await IdentityDataSource.manager.save(spaceIdentity)

    //Shares the new space with the user with the "manager" role
    await shareSpaceWithUser(ocisSpace.id, ocisUser.onPremisesSamAccountName, OcisRole.MANAGER)
  } catch (error) {
    throw error
  }
}
