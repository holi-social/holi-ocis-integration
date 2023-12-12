import { logPhase } from '../logger'
import { SpaceUpdatedDataPayload } from '../types'
import { updateOrCreateOcisSpace } from './helpers'

//Handles SpaceUpdated event from Google Cloud Pub/Sub.
export const spaceUpdatedHandler = async (messageId: string, payload: SpaceUpdatedDataPayload): Promise<void> => {
  try {
    const { space } = payload
    await logPhase(messageId, 'spaceUpdatedHandler.updateOrCreateOcisSpace')(() => updateOrCreateOcisSpace(space))
  } catch (error) {
    throw new Error(`Failed to update space ${error}`)
  }
}
