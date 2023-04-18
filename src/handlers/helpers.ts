import { SpaceMappingRepository, UserMappingRepository } from '../db'
import { logger } from '../logger'
import { createSpace, createUser, findSpaceById, findUserByAccountName, findUserById } from '../ocis-api'
import { OcisSpace, OcisUser, SpacePayload, UserPayload } from '../types'

//Finds an existing OCIS user (i.e. either by ID or by account name) or creates a new one based on the given user payload.
export const findOrCreateOcisUser = async (user: UserPayload): Promise<OcisUser> => {
  const userMappingRepository = new UserMappingRepository()
  const userIdentity = await userMappingRepository.findByUserId(user.id)

  if (userIdentity) {
    return await findUserById(userIdentity.ocis_user_id)
  }

  let ocisUser = await findUserByAccountName(user.id)

  if (!ocisUser) {
    ocisUser = await createUser(user)
  }

  await userMappingRepository.create(user.id, ocisUser.id)
  logger.debug('User created successfully', { ocisUser })

  return ocisUser
}

// Finds an existing OCIS space or creates a new one incl. mapping with the given space payload.
export const findOrCreateOcisSpace = async (space: SpacePayload): Promise<OcisSpace> => {
  const spaceMappingRepository = new SpaceMappingRepository()
  const spaceMapping = await spaceMappingRepository.findBySpaceId(space.id)

  if (spaceMapping) {
    return findSpaceById(spaceMapping.ocis_space_id)
  }

  const ocisSpace = await createSpace(space)
  await spaceMappingRepository.create(space.id, ocisSpace.id)
  logger.debug('Space created successfully', { ocisSpace })

  return ocisSpace
}
