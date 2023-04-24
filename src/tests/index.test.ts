import { receiveEvent } from '..'
import { spaceCreatedHandler } from '../handlers/space-created-handler'
import { spaceUserAddedHandler } from '../handlers/space-user-added-handler'
import { userNameUpdatedHandler } from '../handlers/user-name-updated-handler'

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

  it('should call the spaceCreatedHandler when the event type is SpaceCreated', async () => {
    const requestMock = {
      body: {
        message: {
          attributes: { eventType: 'SpaceCreated', eventVersion: '1.0.0' },
          data: encodeBase64(spaceCreatedEventPayload),
          messageId: MESSAGE_ID,
        },
      },
    }

    const responseMock = {
      sendStatus: jest.fn(),
    }

    spaceCreatedHandlerMock.mockResolvedValue()

    await receiveEvent(requestMock, responseMock)

    expect(spaceCreatedHandlerMock).toHaveBeenCalledWith(MESSAGE_ID, spaceCreatedEventPayload)
    expect(responseMock.sendStatus).toHaveBeenCalledWith(201)
  })

  it('should call the spaceUserAddedHandler when the event type is SpaceUserAdded', async () => {
    const requestMock = {
      body: {
        message: {
          attributes: { eventType: 'SpaceUserAdded', eventVersion: '1.0.0' },
          data: encodeBase64(spaceUserAddedEventPayload),
          messageId: MESSAGE_ID,
        },
      },
    }

    const responseMock = {
      sendStatus: jest.fn(),
    }

    spaceUserAddedHandlerMock.mockResolvedValue()

    await receiveEvent(requestMock, responseMock)

    expect(spaceUserAddedHandlerMock).toHaveBeenCalledWith(MESSAGE_ID, spaceUserAddedEventPayload)
    expect(responseMock.sendStatus).toHaveBeenCalledWith(200)
  })

  it('should call the userNameUpdatedHandler when the event type is UserNameUpdated', async () => {
    const requestMock = {
      body: {
        message: {
          attributes: { eventType: 'UserNameUpdated', eventVersion: '1.0.0' },
          data: encodeBase64(userNameUpdatedEventPayload),
          messageId: MESSAGE_ID,
        },
      },
    }

    const responseMock = {
      sendStatus: jest.fn(),
    }

    userNameUpdatedHandlerMock.mockResolvedValue()

    await receiveEvent(requestMock, responseMock)

    expect(userNameUpdatedHandlerMock).toHaveBeenCalledWith(MESSAGE_ID, userNameUpdatedEventPayload)
    expect(responseMock.sendStatus).toHaveBeenCalledWith(200)
  })

  it('should throw an error when the event type is unexpected', async () => {
    const unsupportedEvent = 'UnsupportedEvent'

    const requestMock = {
      body: {
        message: {
          attributes: { eventType: unsupportedEvent, eventVersion: '1.0.0' },
          data: encodeBase64(unsupportedEventPayload),
          messageId: MESSAGE_ID,
        },
      },
    }

    const sendMock = jest.fn()

    const responseMock = {
      status: jest.fn().mockReturnValue({ send: sendMock }),
    }

    await expect(receiveEvent(requestMock, responseMock)).rejects.toThrow(
      `Received unexpected event of type ${unsupportedEvent}`
    )
    expect(responseMock.status).toHaveBeenCalledWith(500)
    expect(sendMock).toHaveBeenCalledWith({ error: `Error while processing message: [${MESSAGE_ID}]` })
    expect(spaceCreatedHandlerMock).not.toHaveBeenCalled()
    expect(spaceUserAddedHandlerMock).not.toHaveBeenCalled()
    expect(userNameUpdatedHandlerMock).not.toHaveBeenCalled()
  })
})
