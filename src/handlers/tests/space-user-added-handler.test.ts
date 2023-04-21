import { SpaceMappingRepository } from '../../db'
import { logger } from '../../logger'
import { createSpace, findSpaceById } from '../../ocis-api'
import { SpaceUserAddedDataPayload } from '../../types'
import { findOrCreateOcisUser } from '../helpers'
import { spaceUserAddedHandler } from '../space-user-added-handler'

jest.mock('../../db')
jest.mock('../../logger')
jest.mock('../../ocis-api')
jest.mock('../helpers')

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
    },
    space: {
      id: 'space-id',
      name: 'Test Space',
      slug: 'test-space',
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

    const spaceIdentity = {
      space_id: 'space-id',
      ocis_space_id: 'ocis-space-id',
    }

    ;(findOrCreateOcisUser as jest.Mock).mockResolvedValue(ocisUser)
    ;(findSpaceById as jest.Mock).mockResolvedValue(ocisSpace)
    ;(SpaceMappingRepository.prototype.findBySpaceId as jest.Mock).mockResolvedValue(spaceIdentity)

    await spaceUserAddedHandler(MESSAGE_ID, spaceUserAddedDataPayload)

    expect(findOrCreateOcisUser).toHaveBeenCalledWith(spaceUserAddedDataPayload.user)
    expect(SpaceMappingRepository.prototype.findBySpaceId).toHaveBeenCalledWith(spaceUserAddedDataPayload.space.id)
    expect(findSpaceById).toHaveBeenCalledWith(spaceIdentity.ocis_space_id)
    expect(logger.debug).toHaveBeenCalledWith('User added to space successfully', { ocisUser, ocisSpace })
  })

  it('should throw an error if any operation fails', async () => {
    const error = 'Failed to add user to space'

    ;(createSpace as jest.Mock).mockRejectedValue(new Error(error))

    await expect(spaceUserAddedHandler(MESSAGE_ID, spaceUserAddedDataPayload)).rejects.toThrow(error)
  })
})
