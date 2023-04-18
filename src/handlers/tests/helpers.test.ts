import { SpaceMappingRepository, UserMappingRepository } from '../../db'
import { logger } from '../../logger'
import { findUserById, findUserByAccountName, createUser, findSpaceById, createSpace } from '../../ocis-api'
import { UserPayload, OcisUser, OcisUserType, OcisSpace } from '../../types'
import { findOrCreateOcisSpace, findOrCreateOcisUser } from '../helpers'

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
  let loggerDebugMock: jest.MockedFunction<typeof logger.debug>

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
    loggerDebugMock = logger.debug as jest.MockedFunction<typeof logger.debug>
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
    expect(loggerDebugMock).toHaveBeenCalledWith('User created successfully', { ocisUser })
  })
})


describe('findOrCreateOcisSpace', () => {
  const ocisSpace: OcisSpace = {
    id: 'ocis-space-id',
    driveAlias: '',
    driveType: '',
    lastModifiedDateTime: '',
    name: '',
    owner: {
      user: {
        displayName: '',
        id: ''
      }
    },
    quota: {
      remaining: 0,
      state: '',
      total: 0,
      used: 0
    },
    root: {
      eTag: '',
      id: '',
      permissions: [{
        grantedTo: [{
          user: {
            id: 'ocis-user-id',
            displayName: 'OCIS user',
          }
        }],
        roles: [],
      }],
      webDavUrl: ''
    },
    webUrl: ''
  }
  const spacePayload = {
    id: 'space-id',
    name: 'Test Space',
    slug: 'test-space',
  }
  const spaceMapping = { id: 1, space_id: spacePayload.id, ocis_space_id: ocisSpace.id }
  let spaceMappingFindBySpaceIdMock: jest.MockedFunction<typeof SpaceMappingRepository.prototype.findBySpaceId>
  let spaceMappingCreateMock: jest.MockedFunction<typeof SpaceMappingRepository.prototype.create>
  let findSpaceByIdMock = findSpaceById as jest.MockedFunction<typeof findSpaceById>
  let createSpaceMock = createSpace as jest.MockedFunction<typeof createSpace>
  const loggerDebugMock = logger.debug as jest.MockedFunction<typeof logger.debug>

  afterEach(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
    spaceMappingFindBySpaceIdMock = SpaceMappingRepository.prototype.findBySpaceId as jest.Mock
    spaceMappingCreateMock = SpaceMappingRepository.prototype.create as jest.Mock
  })

  it('should return an existing space by ID', async () => {
    spaceMappingFindBySpaceIdMock.mockResolvedValueOnce(spaceMapping)
    findSpaceByIdMock.mockResolvedValueOnce(ocisSpace)

    const result = await findOrCreateOcisSpace(spacePayload)

    expect(result).toEqual(ocisSpace)
    expect(spaceMappingFindBySpaceIdMock).toHaveBeenCalledWith(spacePayload.id)
    expect(findSpaceByIdMock).toHaveBeenCalledWith(ocisSpace.id)
    expect(createSpaceMock).not.toHaveBeenCalled()
    expect(spaceMappingCreateMock).not.toHaveBeenCalled()
  })

  it('should create a new space if none is found', async () => {
    createSpaceMock.mockResolvedValueOnce(ocisSpace)

    const result = await findOrCreateOcisSpace(spacePayload)

    expect(result).toEqual(ocisSpace)
    expect(spaceMappingFindBySpaceIdMock).toHaveBeenCalledWith(spacePayload.id)
    expect(findSpaceByIdMock).not.toHaveBeenCalled()
    expect(createSpaceMock).toHaveBeenCalledWith(spacePayload)
    expect(spaceMappingCreateMock).toHaveBeenCalledWith(spacePayload.id, ocisSpace.id)
    expect(loggerDebugMock).toHaveBeenCalledWith('Space created successfully', { ocisSpace })
  })
})
