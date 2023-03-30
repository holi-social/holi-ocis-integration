import { spaceCreatedHandler } from './handlers/space-created-handler'
import { spaceUserAddedHandler } from './handlers/space-user-added-handler'

import { EventType } from './types'

export const receiveEvent = async (event) => {
  const {
    data,
    attributes: { eventType },
  } = event

  const buffer = Buffer.from(data, 'base64')
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
