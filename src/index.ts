import { assignUserRole, createSpace, createUser, findUserById, shareSpaceWithUser } from './ocis-api'
import { OcisDefaultUUIDRole, OcisRole, SpaceCreatedDataPayload } from './types'

export const receiveEvent = async (event) => {
  const message = event.data.message
  const eventType = message.attributes.eventType
  const buffer = Buffer.from(message.data, 'base64')
  const payload = JSON.parse(buffer.toString())

  switch (eventType) {
    //Handles the SpaceCreated event from Google Cloud Pub/Sub and performs the following tasks
    case 'SpaceCreated':
      try {
        const { user, space } = payload as SpaceCreatedDataPayload

        //Finds or creates an oCIS user based on the user information in the event payload
        let ocisUser = await findUserById(user.id)
        if (!ocisUser) {
          ocisUser = await createUser(user)
        }
        //Assigns the "Space Admin" role to the user
        await assignUserRole(ocisUser.id, OcisDefaultUUIDRole.SPACE_ADMIN)

        //Creates a new space in oCIS based on the space information in the event payload
        const ocisSpace = await createSpace(space)

        //Shares the new space with the user with the "manager" role
        await shareSpaceWithUser(ocisSpace.id, ocisUser.onPremisesSamAccountName, OcisRole.MANAGER)
      } catch (error) {
        throw error
      }
      break
    default:
      console.log('Received unexpected event', eventType)
  }
}
