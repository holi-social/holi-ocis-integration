import { receiveEvent } from '..'
import { spaceCreatedHandler } from '../handlers/space-created-handler'
import { spaceUserAddedHandler } from '../handlers/space-user-added-handler'
import { userNameUpdatedHandler } from '../handlers/user-name-updated-handler'
import { logger } from '../logger'
import * as config from '../config'

jest.mock('../handlers/space-created-handler')
jest.mock('../handlers/space-user-added-handler')
jest.mock('../handlers/user-name-updated-handler')
jest.mock('../logger')

describe('receiveEvent', () => {
  let spaceCreatedHandlerMock: jest.MockedFunction<typeof spaceCreatedHandler>
  let spaceUserAddedHandlerMock: jest.MockedFunction<typeof spaceUserAddedHandler>
  let userNameUpdatedHandlerMock: jest.MockedFunction<typeof userNameUpdatedHandler>
  let loggerInfoMock: jest.MockedFunction<typeof logger.info>

  beforeEach(() => {
    spaceCreatedHandlerMock = spaceCreatedHandler as jest.MockedFunction<typeof spaceCreatedHandler>
    spaceUserAddedHandlerMock = spaceUserAddedHandler as jest.MockedFunction<typeof spaceUserAddedHandler>
    userNameUpdatedHandlerMock = userNameUpdatedHandler as jest.MockedFunction<typeof userNameUpdatedHandler>
    loggerInfoMock = logger.info as jest.MockedFunction<typeof logger.info>
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
            data: 'ewogICAgImNyZWF0b3IiOiB7CiAgICAgICAgImlkIjogInRlc3QtdXNlci1pZCIsCiAgICAgICAgIm5hbWUiOiAiVGVzdCBVc2VyIiwKICAgICAgICAiZW1haWwiOiAidGVzdC1lbWFpbEBleGFtcGxlLmNvbSIKICAgIH0sCiAgICAic3BhY2UiOiB7CiAgICAgICAgImlkIjogInNwYWNlLWlkIiwKICAgICAgICAibmFtZSI6ICJUZXN0IFNwYWNlIiwKICAgICAgICAic2x1ZyI6ICJ0ZXN0LXNwYWNlIgogICAgfQp9Cg==',
          },
        },
      }

      await receiveEvent(event)

      expect(loggerInfoMock).toHaveBeenCalledWith('Event received', { event })
      expect(spaceCreatedHandlerMock).toHaveBeenCalledWith({
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
      })
    })

    it('should call the spaceUserAddedHandler when the event type is SpaceUserAdded', async () => {
      const event = {
        data: {
          message: {
            attributes: { eventType: 'SpaceUserAdded', eventVersion: '1.0.0' },
            data: 'ewogICJ1c2VyIjogewogICAgImlkIjogInRlc3QtdXNlci1pZCIsCiAgICAibmFtZSI6ICJUZXN0IFVzZXIiLAogICAgImVtYWlsIjogInRlc3QtZW1haWxAZXhhbXBsZS5jb20iCiAgfSwKICAic3BhY2UiOiB7CiAgICAiaWQiOiAic3BhY2UtaWQiLAogICAgIm5hbWUiOiAiVGVzdCBTcGFjZSIsCiAgICAic2x1ZyI6ICJ0ZXN0LXNwYWNlIgogIH0KfQo=',
          },
        },
      }

      await receiveEvent(event)

      expect(loggerInfoMock).toHaveBeenCalledWith('Event received', { event })
      expect(spaceUserAddedHandlerMock).toHaveBeenCalledWith({
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
      })
    })

    it('should call the userNameUpdatedHandler when the event type is UserNameUpdated', async () => {
      const event = {
        data: {
          message: {
            attributes: { eventType: 'UserNameUpdated', eventVersion: '1.0.0' },
            data: 'ewogICJ1c2VyIjogewogICAgImlkIjogInRlc3QtdXNlci1pZCIsCiAgICAibmFtZSI6ICJUZXN0IFVzZXIiLAogICAgImVtYWlsIjogInRlc3QtZW1haWxAZXhhbXBsZS5jb20iCiAgfQp9Cg==',
          },
        },
      }

      await receiveEvent(event)

      expect(loggerInfoMock).toHaveBeenCalledWith('Event received', { event })
      expect(userNameUpdatedHandlerMock).toHaveBeenCalledWith({
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test-email@example.com',
        },
      })
    })

    it('should throw an error when the event type is unexpected', async () => {
      const unsupportedEvent = 'UnsupportedEvent'
      const event = {
        data: {
          message: {
            attributes: { eventType: unsupportedEvent, eventVersion: '1.0.0' },
            data: 'ewogICJ1c2VyIjogewogICAgImlkIjogInRlc3QtdXNlci1pZCIsCiAgICAibmFtZSI6ICJUZXN0IFVzZXIiLAogICAgImVtYWlsIjogInRlc3QtZW1haWxAZXhhbXBsZS5jb20iCiAgfSwKICAic3BhY2UiOiB7CiAgICAiaWQiOiAic3BhY2UtaWQiLAogICAgIm5hbWUiOiAiVGVzdCBTcGFjZSIsCiAgICAic2x1ZyI6ICJ0ZXN0LXNwYWNlIgogIH0KfQo=',
          },
        },
      }

      await expect(receiveEvent(event)).rejects.toThrow(`Received unexpected event of type ${unsupportedEvent}`)
      expect(loggerInfoMock).toHaveBeenCalledWith('Event received', { event })
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
        attributes: { eventType: 'SpaceCreated', eventVersion: '1.0.0' },
        data: 'ewogICAgImNyZWF0b3IiOiB7CiAgICAgICAgImlkIjogInRlc3QtdXNlci1pZCIsCiAgICAgICAgIm5hbWUiOiAiVGVzdCBVc2VyIiwKICAgICAgICAiZW1haWwiOiAidGVzdC1lbWFpbEBleGFtcGxlLmNvbSIKICAgIH0sCiAgICAic3BhY2UiOiB7CiAgICAgICAgImlkIjogInNwYWNlLWlkIiwKICAgICAgICAibmFtZSI6ICJUZXN0IFNwYWNlIiwKICAgICAgICAic2x1ZyI6ICJ0ZXN0LXNwYWNlIgogICAgfQp9Cg==',
      }

      await receiveEvent(event)

      expect(loggerInfoMock).toHaveBeenCalledWith('Event received', { event })
      expect(spaceCreatedHandlerMock).toHaveBeenCalledWith({
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
      })
    })

    it('should call the spaceUserAddedHandler when the event type is SpaceUserAdded', async () => {
      const event = {
        attributes: { eventType: 'SpaceUserAdded', eventVersion: '1.0.0' },
        data: 'ewogICJ1c2VyIjogewogICAgImlkIjogInRlc3QtdXNlci1pZCIsCiAgICAibmFtZSI6ICJUZXN0IFVzZXIiLAogICAgImVtYWlsIjogInRlc3QtZW1haWxAZXhhbXBsZS5jb20iCiAgfSwKICAic3BhY2UiOiB7CiAgICAiaWQiOiAic3BhY2UtaWQiLAogICAgIm5hbWUiOiAiVGVzdCBTcGFjZSIsCiAgICAic2x1ZyI6ICJ0ZXN0LXNwYWNlIgogIH0KfQo=',
      }

      await receiveEvent(event)

      expect(loggerInfoMock).toHaveBeenCalledWith('Event received', { event })
      expect(spaceUserAddedHandlerMock).toHaveBeenCalledWith({
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
      })
    })

    it('should call the userNameUpdatedHandler when the event type is UserNameUpdated', async () => {
      const event = {
        attributes: { eventType: 'UserNameUpdated', eventVersion: '1.0.0' },
        data: 'ewogICJ1c2VyIjogewogICAgImlkIjogInRlc3QtdXNlci1pZCIsCiAgICAibmFtZSI6ICJUZXN0IFVzZXIiLAogICAgImVtYWlsIjogInRlc3QtZW1haWxAZXhhbXBsZS5jb20iCiAgfQp9Cg==',
      }

      await receiveEvent(event)

      expect(loggerInfoMock).toHaveBeenCalledWith('Event received', { event })
      expect(userNameUpdatedHandlerMock).toHaveBeenCalledWith({
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test-email@example.com',
        },
      })
    })

    it('should throw an error when the event type is unexpected', async () => {
      const unsupportedEvent = 'UnsupportedEvent'
      const event = {
        attributes: { eventType: unsupportedEvent, eventVersion: '1.0.0' },
        data: 'ewogICJ1c2VyIjogewogICAgImlkIjogInRlc3QtdXNlci1pZCIsCiAgICAibmFtZSI6ICJUZXN0IFVzZXIiLAogICAgImVtYWlsIjogInRlc3QtZW1haWxAZXhhbXBsZS5jb20iCiAgfSwKICAic3BhY2UiOiB7CiAgICAiaWQiOiAic3BhY2UtaWQiLAogICAgIm5hbWUiOiAiVGVzdCBTcGFjZSIsCiAgICAic2x1ZyI6ICJ0ZXN0LXNwYWNlIgogIH0KfQo=',
      }

      await expect(receiveEvent(event)).rejects.toThrow(`Received unexpected event of type ${unsupportedEvent}`)
      expect(loggerInfoMock).toHaveBeenCalledWith('Event received', { event })
      expect(spaceCreatedHandlerMock).not.toHaveBeenCalled()
      expect(spaceUserAddedHandlerMock).not.toHaveBeenCalled()
      expect(userNameUpdatedHandlerMock).not.toHaveBeenCalled()
    })
  })
})
