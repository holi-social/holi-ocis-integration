import { logger } from '../../logger'
import { createSpace, shareSpaceWithUser } from '../../ocis-api'
import { SpaceUserAddedDataPayload } from '../../types'
import { findOrCreateOcisSpace, findOrCreateOcisUser } from '../helpers'
import { spaceUserAddedHandler } from '../space-user-added-handler'

jest.mock('../../db')
jest.mock('../../ocis-api')
jest.mock('../helpers')

jest.mock('../../logger', () => {
  return {
    logger: {
      debug: jest.fn(),
    },
    logPhase: jest.fn((_messageId: string, _phaseName: string) => (fn) => fn()),
  }
})

const MESSAGE_ID = '42'

describe('spaceUserAddedHandler', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  const spaceUserAddedDataPayload: SpaceUserAddedDataPayload = {
    user: {
      id: 'user-id',
      email: 'user-email@example.com',
      name: 'Test User',
      avatar: 'avatar.png',
      identity: 'user-identity',
    },
    space: {
      id: 'space-id',
      name: 'Test Space',
      slug: 'test-space',
      avatar: 'avatar.png',
      avatarDefaultColor: '#FFFFFF',
    },
  }

  it('should add user to space', async () => {
    const ocisUser = {
      id: 'ocis-user-id',
      onPremisesSamAccountName: 'holi_user-id',
    }

    const ocisSpace = {
      id: 'ocis-space-id',
    }

    ;(findOrCreateOcisUser as jest.Mock).mockResolvedValue(ocisUser)
    ;(findOrCreateOcisSpace as jest.Mock).mockResolvedValue(ocisSpace)
    ;(shareSpaceWithUser as jest.Mock).mockResolvedValue(null)

    await spaceUserAddedHandler(MESSAGE_ID, spaceUserAddedDataPayload)

    expect(findOrCreateOcisUser).toHaveBeenCalledWith(spaceUserAddedDataPayload.user)
    expect(findOrCreateOcisSpace).toHaveBeenCalledWith(spaceUserAddedDataPayload.space)
    expect(logger.debug).toHaveBeenCalledWith('User added to space successfully', { ocisUser, ocisSpace })
  })

  it('should throw an error if any operation fails', async () => {
    const error = 'Failed to add user to space'

    ;(createSpace as jest.Mock).mockRejectedValue(new Error(error))

    await expect(spaceUserAddedHandler(MESSAGE_ID, spaceUserAddedDataPayload)).rejects.toThrow(error)
  })
})
