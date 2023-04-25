import { logger } from '../../logger'
import { updateUser } from '../../ocis-api'
import { UserNameUpdatedDataPayload } from '../../types'
import { updateOrCreateOcisUser } from '../helpers'
import { userNameUpdatedHandler } from '../user-name-updated-handler'

jest.mock('../../db')
jest.mock('../../ocis-api')
jest.mock('../helpers')

jest.mock('../../logger', () => {
  return {
    logger: {
      debug: jest.fn(),
      warn: jest.fn(),
    },
    logPhase: jest.fn((_messageId: string, _phaseName: string) => (fn) => fn()),
  }
})

describe('spaceUserAddedHandler', () => {
  const MESSAGE_ID = '42'

  const userNameUpdatedDataPayload: UserNameUpdatedDataPayload = {
    user: {
      id: 'user-id',
      email: 'user-email@example.com',
      name: 'New Test User',
    },
  }

  let updateOrCreateOcisUserMock: jest.MockedFunction<typeof updateOrCreateOcisUser>

  beforeEach(() => {
    updateOrCreateOcisUserMock = updateOrCreateOcisUser as jest.MockedFunction<typeof updateOrCreateOcisUser>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should update the user name', async () => {
    const updatedOcisUser = {
      id: 'ocis-user-id',
      displayName: 'New Test User',
    }

    ;(updateOrCreateOcisUserMock as jest.Mock).mockResolvedValue(updatedOcisUser)

    await userNameUpdatedHandler(MESSAGE_ID, userNameUpdatedDataPayload)

    expect(updateOrCreateOcisUserMock).toHaveBeenCalledWith(userNameUpdatedDataPayload.user)
    expect(logger.debug).toHaveBeenCalledWith('User name updated successfully', { ocisUser: updatedOcisUser })
  })

  it('should throw an error if any operation fails', async () => {
    const error = 'Failed to update user name'

    ;(updateUser as jest.Mock).mockRejectedValue(new Error(error))

    await expect(userNameUpdatedHandler(MESSAGE_ID, userNameUpdatedDataPayload)).rejects.toThrow(error)
  })
})
