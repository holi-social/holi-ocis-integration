import { ENVIRONMENT } from './config'
import { spaceCreatedHandler } from './handlers/space-created-handler'
import { spaceUserAddedHandler } from './handlers/space-user-added-handler'
import { userNameUpdatedHandler } from './handlers/user-name-updated-handler'
import { logger } from './logger'

import { EventType } from './types'

//Processes events received from both the Google Pub/Sub Emulator and Cloud Pub/Sub, which have different body structures.
const extractEventDetails = (event) => {
  let message
  if (ENVIRONMENT === 'local') {
    message = { ...event.data.message }
  } else {
    message = { ...event.body.message }
  }
  const {
    data,
    attributes: { eventType },
  } = message
  const buffer = Buffer.from(data, 'base64')
  const payload = JSON.parse(buffer.toString())
  return { eventType, payload }
}

export const receiveEvent = async (event) => {
  logger.debug('Event received', { event })

  const { eventType, payload } = extractEventDetails(event)

  switch (eventType) {
    case EventType.SPACE_CREATED:
      logger.debug('Handling SPACE_CREATED event')
      await spaceCreatedHandler(payload)
      break
    case EventType.SPACE_USER_ADDED:
      logger.debug('Handling SPACE_USER_ADDED event')
      await spaceUserAddedHandler(payload)
      break
    case EventType.USER_NAME_UPDATED:
      logger.debug('Handling USER_NAME_UPDATED event')
      await userNameUpdatedHandler(payload)
      break
    default:
      throw new Error(`Received unexpected event of type ${eventType}`)
  }
}
