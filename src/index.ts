import { ENVIRONMENT } from './config'
import { spaceCreatedHandler } from './handlers/space-created-handler'
import { spaceUserAddedHandler } from './handlers/space-user-added-handler'
import { userNameUpdatedHandler } from './handlers/user-name-updated-handler'
import { logPhase, logger } from './logger'

import { EventType } from './types'

//Processes events received from both the Google Pub/Sub Emulator and Cloud Pub/Sub, which have different body structures.
const extractEventDetails = (event) => {
  try {
    let message
    if (ENVIRONMENT === 'local') {
      // Pub/Sub Emulator
      message = { ...event.data.message }
    } else {
      // Cloud Pub/Sub
      message = { ...event.body.message }
    }
    const {
      data,
      attributes: { eventType },
      messageId,
    } = message
    const buffer = Buffer.from(data, 'base64')
    const payload = JSON.parse(buffer.toString())
    logger.debug('[' + messageId + '] Event of type ' + eventType + ' extracted successfully', { event })
    return { eventType, payload, messageId }
  } catch (e) {
    logger.error('Error parsing message:', e)
    throw e
  }
}

export const receiveEvent = async (event): Promise<void> => {
  logger.debug('Event received', { event })

  const { eventType, payload, messageId } = extractEventDetails(event)

  try {
    switch (eventType) {
      case EventType.SPACE_CREATED:
        await logPhase(messageId, 'spaceCreatedHandler')(() => spaceCreatedHandler(messageId, payload))
        break
      case EventType.SPACE_USER_ADDED:
        await logPhase(messageId, 'spaceUserAddedHandler')(() => spaceUserAddedHandler(messageId, payload))
        break
      case EventType.USER_NAME_UPDATED:
        await logPhase(messageId, 'userNameUpdatedHandler')(() => userNameUpdatedHandler(messageId, payload))
        break
      default:
        throw new Error(`Received unexpected event of type ${eventType}`)
    }
  } catch (e) {
    logger.error('[' + messageId + '] Error while processing message:', e)
    throw e
  }
}

const functions = require('@google-cloud/functions-framework')
functions.cloudEvent('receiveEvent', receiveEvent)
