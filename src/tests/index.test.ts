import { receiveEvent } from '..'
import { spaceCreatedHandler } from '../handlers/space-created-handler'
import { spaceUserAddedHandler } from '../handlers/space-user-added-handler'
import { userNameUpdatedHandler } from '../handlers/user-name-updated-handler'
import * as config from '../config'

jest.mock('../handlers/space-created-handler')
jest.mock('../handlers/space-user-added-handler')
jest.mock('../handlers/user-name-updated-handler')

const MESSAGE_ID = '42'

const encodeBase64 = (payload) => {
  return Buffer.from(JSON.stringify(payload))
}

describe('receiveEvent', () => {
  const spaceCreatedEventPayload = {
    creator: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test-email@example.com',
    },
    space: {
      id: 'space-id',
      name: 'Test Space',
      slug: 'test-space',
    },
  }

  const userNameUpdatedEventPayload = {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test-email@example.com',
    },
  }

  const spaceUserAddedEventPayload = {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test-email@example.com',
    },
    space: {
      id: 'space-id',
      name: 'Test Space',
      slug: 'test-space',
    },
  }

  const unsupportedEventPayload = {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test-email@example.com',
    },
  }

  let spaceCreatedHandlerMock: jest.MockedFunction<typeof spaceCreatedHandler>
  let spaceUserAddedHandlerMock: jest.MockedFunction<typeof spaceUserAddedHandler>
  let userNameUpdatedHandlerMock: jest.MockedFunction<typeof userNameUpdatedHandler>

  beforeEach(() => {
    spaceCreatedHandlerMock = spaceCreatedHandler as jest.MockedFunction<typeof spaceCreatedHandler>
    spaceUserAddedHandlerMock = spaceUserAddedHandler as jest.MockedFunction<typeof spaceUserAddedHandler>
    userNameUpdatedHandlerMock = userNameUpdatedHandler as jest.MockedFunction<typeof userNameUpdatedHandler>
    jest.resetModules()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Google Pub/Sub Emulator', () => {
    beforeEach(() => {
      Object.defineProperty(config, 'ENVIRONMENT', { value: 'local', configurable: true })
    })

    it('should call the spaceCreatedHandler when the event type is SpaceCreated', async () => {
      const event = {
        data: {
          message: {
            attributes: { eventType: 'SpaceCreated', eventVersion: '1.0.0' },
            data: encodeBase64(spaceCreatedEventPayload),
            messageId: MESSAGE_ID,
          },
        },
      }

      spaceCreatedHandlerMock.mockResolvedValue()

      await receiveEvent(event)

      expect(spaceCreatedHandlerMock).toHaveBeenCalledWith(MESSAGE_ID, spaceCreatedEventPayload)
    })

    it('should call the spaceUserAddedHandler when the event type is SpaceUserAdded', async () => {
      const event = {
        data: {
          message: {
            attributes: { eventType: 'SpaceUserAdded', eventVersion: '1.0.0' },
            data: encodeBase64(spaceUserAddedEventPayload),
            messageId: MESSAGE_ID,
          },
        },
      }

      spaceUserAddedHandlerMock.mockResolvedValue()

      await receiveEvent(event)

      expect(spaceUserAddedHandlerMock).toHaveBeenCalledWith(MESSAGE_ID, spaceUserAddedEventPayload)
    })

    it('should call the userNameUpdatedHandler when the event type is UserNameUpdated', async () => {
      const event = {
        data: {
          message: {
            attributes: { eventType: 'UserNameUpdated', eventVersion: '1.0.0' },
            data: encodeBase64(userNameUpdatedEventPayload),
            messageId: MESSAGE_ID,
          },
        },
      }

      userNameUpdatedHandlerMock.mockResolvedValue()

      await receiveEvent(event)

      expect(userNameUpdatedHandlerMock).toHaveBeenCalledWith(MESSAGE_ID, userNameUpdatedEventPayload)
    })

    it('should throw an error when the event type is unexpected', async () => {
      const unsupportedEvent = 'UnsupportedEvent'
      const event = {
        data: {
          message: {
            attributes: { eventType: unsupportedEvent, eventVersion: '1.0.0' },
            data: encodeBase64(unsupportedEventPayload),
          },
        },
      }

      await expect(receiveEvent(event)).rejects.toThrow(`Received unexpected event of type ${unsupportedEvent}`)
      expect(spaceCreatedHandlerMock).not.toHaveBeenCalled()
      expect(spaceUserAddedHandlerMock).not.toHaveBeenCalled()
      expect(userNameUpdatedHandlerMock).not.toHaveBeenCalled()
    })
  })

  describe('Google Pub/Sub Cloud', () => {
    beforeEach(() => {
      Object.defineProperty(config, 'ENVIRONMENT', { value: 'staging', configurable: true })
    })
    it('should call the spaceCreatedHandler when the event type is SpaceCreated', async () => {
      const event = {
        body: {
          message: {
            attributes: { eventType: 'SpaceCreated', eventVersion: '1.0.0' },
            data: encodeBase64(spaceCreatedEventPayload),
            messageId: MESSAGE_ID,
          },
        },
      }

      spaceCreatedHandlerMock.mockResolvedValue()

      await receiveEvent(event)

      expect(spaceCreatedHandlerMock).toHaveBeenCalledWith(MESSAGE_ID, spaceCreatedEventPayload)
    })

    it('should call the spaceUserAddedHandler when the event type is SpaceUserAdded', async () => {
      const event = {
        body: {
          message: {
            attributes: { eventType: 'SpaceUserAdded', eventVersion: '1.0.0' },
            data: encodeBase64(spaceUserAddedEventPayload),
            messageId: MESSAGE_ID,
          },
        },
      }

      spaceUserAddedHandlerMock.mockResolvedValue()

      await receiveEvent(event)

      expect(spaceUserAddedHandlerMock).toHaveBeenCalledWith(MESSAGE_ID, spaceUserAddedEventPayload)
    })

    it('should call the userNameUpdatedHandler when the event type is UserNameUpdated', async () => {
      const event = {
        body: {
          message: {
            attributes: { eventType: 'UserNameUpdated', eventVersion: '1.0.0' },
            data: encodeBase64(userNameUpdatedEventPayload),
            messageId: MESSAGE_ID,
          },
        },
      }

      userNameUpdatedHandlerMock.mockResolvedValue()

      await receiveEvent(event)

      expect(userNameUpdatedHandlerMock).toHaveBeenCalledWith(MESSAGE_ID, userNameUpdatedEventPayload)
    })

    it('should throw an error when the event type is unexpected', async () => {
      const unsupportedEvent = 'UnsupportedEvent'
      const event = {
        body: {
          message: {
            attributes: { eventType: unsupportedEvent, eventVersion: '1.0.0' },
            data: encodeBase64(unsupportedEventPayload),
          },
        },
      }

      await expect(receiveEvent(event)).rejects.toThrow(`Received unexpected event of type ${unsupportedEvent}`)
      expect(spaceCreatedHandlerMock).not.toHaveBeenCalled()
      expect(spaceUserAddedHandlerMock).not.toHaveBeenCalled()
      expect(userNameUpdatedHandlerMock).not.toHaveBeenCalled()
    })
  })
})
