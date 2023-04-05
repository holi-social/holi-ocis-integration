import { UserMappingRepository } from '../../db'
import { logger } from '../../logger'
import { findUserById, findUserByAccountName, createUser } from '../../ocis-api'
import { UserPayload, OcisUser, OcisUserType } from '../../types'
import { findOrCreateOcisUser } from '../helpers'

jest.mock('../../db')
jest.mock('../../logger')
jest.mock('../../ocis-api')

describe('findOrCreateOcisUser', () => {
  let user: UserPayload
  let ocisUser: OcisUser
  let userIdentity

  let userMappingRepositoryfindByUserIdMock: jest.MockedFunction<typeof UserMappingRepository.prototype.findByUserId>
  let userMappingRepositorycreateMock: jest.MockedFunction<typeof UserMappingRepository.prototype.create>

  let findUserByIdMock: jest.MockedFunction<typeof findUserById>
  let findUserByAccountNameMock: jest.MockedFunction<typeof findUserByAccountName>
  let createUserMock: jest.MockedFunction<typeof createUser>
  let loggerInfoMock: jest.MockedFunction<typeof logger.info>

  beforeEach(() => {
    user = {
      id: 'user-id',
      email: 'user-email@example.com',
      name: 'Test User',
    }
    ocisUser = {
      id: 'ocis-user-id',
      accountEnabled: true,
      displayName: 'Test User',
      givenName: '',
      mail: '',
      onPremisesSamAccountName: 'holi_user-id',
      surname: '',
      userType: OcisUserType.MEMBER,
    }
    userIdentity = { id: 1, user_id: user.id, ocis_user_id: ocisUser.id }
    userMappingRepositoryfindByUserIdMock = UserMappingRepository.prototype.findByUserId as jest.Mock
    userMappingRepositorycreateMock = UserMappingRepository.prototype.create as jest.Mock

    findUserByIdMock = findUserById as jest.MockedFunction<typeof findUserById>
    findUserByAccountNameMock = findUserByAccountName as jest.MockedFunction<typeof findUserByAccountName>
    createUserMock = createUser as jest.MockedFunction<typeof createUser>
    loggerInfoMock = logger.info as jest.MockedFunction<typeof logger.info>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should return an existing user by ID', async () => {
    userMappingRepositoryfindByUserIdMock.mockResolvedValueOnce(userIdentity)

    findUserByIdMock.mockResolvedValueOnce(ocisUser)

    const result = await findOrCreateOcisUser(user)

    expect(result).toEqual(ocisUser)
    expect(userMappingRepositoryfindByUserIdMock).toHaveBeenCalledWith(user.id)
    expect(findUserByIdMock).toHaveBeenCalledWith(userIdentity.ocis_user_id)
    expect(findUserByAccountNameMock).not.toHaveBeenCalled()
    expect(createUserMock).not.toHaveBeenCalled()
    expect(userMappingRepositorycreateMock).not.toHaveBeenCalled()
  })

  it('should return an existing user by account name', async () => {
    findUserByAccountNameMock.mockResolvedValueOnce(ocisUser)

    const result = await findOrCreateOcisUser(user)

    expect(result).toEqual(ocisUser)
    expect(userMappingRepositoryfindByUserIdMock).toHaveBeenCalledWith(user.id)
    expect(findUserByIdMock).not.toHaveBeenCalled()
    expect(findUserByAccountNameMock).toHaveBeenCalledWith(user.id)
    expect(createUserMock).not.toHaveBeenCalled()
    expect(userMappingRepositorycreateMock).toHaveBeenCalled()
  })

  it('should create a new user if none is found', async () => {
    createUserMock.mockResolvedValueOnce(ocisUser)

    const result = await findOrCreateOcisUser(user)

    expect(result).toEqual(ocisUser)
    expect(userMappingRepositoryfindByUserIdMock).toHaveBeenCalledWith(user.id)
    expect(findUserByIdMock).not.toHaveBeenCalled()
    expect(findUserByAccountNameMock).toHaveBeenCalledWith(user.id)
    expect(createUserMock).toHaveBeenCalledWith(user)
    expect(userMappingRepositorycreateMock).toHaveBeenCalledWith(user.id, ocisUser.id)
    expect(loggerInfoMock).toHaveBeenCalledWith('User created successfully', { ocisUser })
  })
})
