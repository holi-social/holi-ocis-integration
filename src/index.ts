import { ENVIRONMENT } from './config'
import { spaceCreatedHandler } from './handlers/space-created-handler'
import { spaceUserAddedHandler } from './handlers/space-user-added-handler'
import { logger } from './logger'

import { EventType } from './types'

//Processes events received from both the Google Pub/Sub Emulator and Cloud Pub/Sub, which have different body structures.
const extractEventDetails = (event) => {
  let body
  if (ENVIRONMENT === 'local') {
    body = { ...event.data.message }
  } else {
    body = { ...event }
  }
  const {
    data,
    attributes: { eventType },
  } = body
  const buffer = Buffer.from(data, 'base64')
  const payload = JSON.parse(buffer.toString())
  return { eventType, payload }
}

export const receiveEvent = async (event) => {
  logger.info({ event })

  const { eventType, payload } = extractEventDetails(event)

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
