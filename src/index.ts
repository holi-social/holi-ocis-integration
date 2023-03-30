import { spaceCreatedHandler } from './handlers/space-created-handler'
import { spaceUserAddedHandler } from './handlers/space-user-added-handler'

import { EventType } from './types'

export const receiveEvent = async (event) => {
  console.info(`Event recieved: ${event}`)

  const message = event.data.message
  const eventType = message.attributes.eventType
  const buffer = Buffer.from(message.data, 'base64')
  const payload = JSON.parse(buffer.toString())

  switch (eventType) {
    case EventType.SPACE_CREATED:
      await spaceCreatedHandler(payload)
      break
    case EventType.SPACE_USER_ADDED:
      await spaceUserAddedHandler(payload)
      break
    default:
      throw new Error(`Received unexpected event of type ${eventType}`)
  }
}
