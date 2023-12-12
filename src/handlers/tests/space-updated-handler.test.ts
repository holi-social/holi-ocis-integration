import { updateSpace } from '../../ocis-api'
import { SpaceUpdatedDataPayload } from '../../types'
import { updateOrCreateOcisSpace } from '../helpers'
import { spaceUpdatedHandler } from '../space-updated-handler'

jest.mock('../../db')
jest.mock('../../ocis-api')
jest.mock('../helpers')

describe('spaceUpdatedHandler', () => {
  const MESSAGE_ID = '42'

  const spaceUpdatedDataPayload: SpaceUpdatedDataPayload = {
    creator: {
      id: 'user-id',
      email: 'user-email@example.com',
      name: 'Test User',
      avatar: 'avatar.png',
      identity: 'user-identity',
    },
    space: {
      id: 'space-id',
      name: 'Updated Test Space',
      slug: 'updated-test-space',
      avatar: 'avatar.png',
      avatarDefaultColor: '#FFFFFF',
    },
  }

  let updateOrCreateOcisSpaceMock: jest.MockedFunction<typeof updateOrCreateOcisSpace>

  beforeEach(() => {
    updateOrCreateOcisSpaceMock = updateOrCreateOcisSpace as jest.MockedFunction<typeof updateOrCreateOcisSpace>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should update the space name', async () => {
    const updatedOcisSpace = {
      id: 'ocis-space-id',
      name: 'Updated Test Space',
      slug: 'updated-test-space',
    }

    ;(updateOrCreateOcisSpaceMock as jest.Mock).mockResolvedValue(updatedOcisSpace)

    await spaceUpdatedHandler(MESSAGE_ID, spaceUpdatedDataPayload)

    expect(updateOrCreateOcisSpaceMock).toHaveBeenCalledWith(spaceUpdatedDataPayload.space)
  })

  it('should throw an error if any operation fails', async () => {
    const error = 'Failed to update space'

    ;(updateSpace as jest.Mock).mockRejectedValue(new Error(error))

    await expect(spaceUpdatedHandler(MESSAGE_ID, spaceUpdatedDataPayload)).rejects.toThrow(error)
  })
})
