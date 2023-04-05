import { UserMappingRepository } from '../../db'
import { logger } from '../../logger'
import { findUserById, updateUser } from '../../ocis-api'
import { UserNameUpdatedDataPayload } from '../../types'
import { userNameUpdatedHandler } from '../user-name-updated-handler'

jest.mock('../../db')
jest.mock('../../logger')
jest.mock('../../ocis-api')
jest.mock('../helpers')

describe('spaceUserAddedHandler', () => {
  const userNameUpdatedDataPayload: UserNameUpdatedDataPayload = {
    user: {
      id: 'user-id',
      email: 'user-email@example.com',
      name: 'New Test User',
    },
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should update the user name', async () => {
    const ocisUser = {
      id: 'ocis-user-id',
      displayName: 'Test User',
    }

    const updatedOcisUser = {
      id: 'ocis-user-id',
      displayName: 'New Test User',
    }

    const userIdentity = {
      user_id: 'user-id',
      ocis_user_id: 'ocis-space-id',
    }
    ;(UserMappingRepository.prototype.findByUserIdOrFail as jest.Mock).mockResolvedValue(userIdentity)
    ;(findUserById as jest.Mock).mockResolvedValue(ocisUser)
    ;(updateUser as jest.Mock).mockResolvedValue(updatedOcisUser)

    await userNameUpdatedHandler(userNameUpdatedDataPayload)

    expect(UserMappingRepository.prototype.findByUserIdOrFail).toHaveBeenCalledWith(userNameUpdatedDataPayload.user.id)
    expect(findUserById).toHaveBeenCalledWith(userIdentity.ocis_user_id)
    expect(logger.info).toHaveBeenCalledWith('User name updated successfully', { updatedOcisUser })
  })

  it('should throw an error if any operation fails', async () => {
    const error = 'Failed to update user name'

    ;(updateUser as jest.Mock).mockRejectedValue(new Error(error))

    await expect(userNameUpdatedHandler(userNameUpdatedDataPayload)).rejects.toThrow(error)
  })
})
