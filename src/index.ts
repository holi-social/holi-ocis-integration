import { ENVIRONMENT } from './config'
import { spaceCreatedHandler } from './handlers/space-created-handler'
import { spaceUserAddedHandler } from './handlers/space-user-added-handler'

import { EventType } from './types'

export const receiveEvent = async (event) => {
  let eventType
  let buffer

  if (ENVIRONMENT === 'local') {
    const {
      message: { data, attributes },
    } = event.data
    eventType = attributes.eventType
    buffer = Buffer.from(data, 'base64')
  } else {
    const { data, attributes } = event
    eventType = attributes.eventType
    buffer = Buffer.from(data, 'base64')
  }

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
