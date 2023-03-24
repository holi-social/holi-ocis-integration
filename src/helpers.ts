import axios, { AxiosResponse } from 'axios'
import { Agent } from 'https'
import { ENVIRONMENT, OWNCLOUD_BASE_URL, OCIS_ADMIN_USERNAME, OCIS_ADMIN_PASSWORD, OCIS_OIDC_ISSUER } from './config'
import { HOLI_PREFIX, HOLI_EMAIL_DOMAIN } from './constants'
import {
  OcisApi,
  OcisSpace,
  OcisUser,
  OcisRole,
  OcisLibreGraphRoute,
  OcisShareType,
  SpacePayload,
  UserPayload,
  OcisUserType,
} from './types'

// Whether to reject unauthorized TLS certificates. Set to false in a local development environment.
const httpsAgent = new Agent({
  rejectUnauthorized: ENVIRONMENT === 'local' ? false : true,
})

/**
 * Finds an OcisUser by ID.
 * @async
 * @function
 * @param {string} id - The ID of the user to find.
 * @returns {Promise<OcisUser|null>} A Promise that resolves to the OcisUser found or null if not found.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const findUserById = async (id: string): Promise<OcisUser | null> => {
  // Construct the URL to retrieve the user.
  const url = `${OWNCLOUD_BASE_URL}/${OcisApi.LIBRE_GRAPH_API_PATH}/${OcisLibreGraphRoute.USERS}/${HOLI_PREFIX}_${id}`

  try {
    // Send a GET request to retrieve the user.
    const { data }: AxiosResponse<OcisUser> = await axios.get(url, {
      auth: {
        username: OCIS_ADMIN_USERNAME,
        password: OCIS_ADMIN_PASSWORD,
      },
      httpsAgent,
    })
    return data
  } catch (error) {
    // Handle errors that occur during the request.
    const { response } = error
    if (response && response.status === 404) {
      return null
    }
    throw error.error
  }
}

/**
 * Creates a new OcisUser.
 * @async
 * @function
 * @param {UserPayload} user - The payload representing the user to be created.
 * @returns {Promise<OcisUser>} A Promise that resolves to the newly created OcisUser.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const createUser = async (user: UserPayload): Promise<OcisUser> => {
  // Construct the URL to create the user.
  const url = `${OWNCLOUD_BASE_URL}/${OcisApi.LIBRE_GRAPH_API_PATH}/${OcisLibreGraphRoute.USERS}`

  try {
    // Send a POST request to create the user.
    const { data }: AxiosResponse<OcisUser> = await axios.post(
      url,
      {
        mail: `${user.id}@${HOLI_EMAIL_DOMAIN}`,
        displayName: user.id,
        onPremisesSamAccountName: `${HOLI_PREFIX}_${user.id}`,
        surname: user.name ? user.name : `${HOLI_PREFIX}_${user.id}`,
        userType: OcisUserType.MEMBER,
        identities: [
          {
            issuer: OCIS_OIDC_ISSUER,
            issuerAssignedId: user.id,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        auth: {
          username: OCIS_ADMIN_USERNAME,
          password: OCIS_ADMIN_PASSWORD,
        },
        httpsAgent,
      }
    )
    return data
  } catch (error) {
    // Handle errors that occur during the request.
    throw error
  }
}

/**
 * Assigns a role to an OcisUser.
 * @async
 * @function
 * @param {string} userId - The ID of the user to assign the role to.
 * @param {string} roleId - The ID of the role to assign to the user.
 * @returns {Promise<void>} A Promise that resolves when the role is successfully assigned.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const assignUserRole = async (userId: string, roleId: string): Promise<void> => {
  // Construct the URL to assign the role.
  const url = `${OWNCLOUD_BASE_URL}/${OcisApi.SETTINGS_API_PATH}/assignments-add`

  try {
    // Send a POST request to assign the role.
    await axios.post(
      url,
      {
        account_uuid: userId,
        role_id: roleId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        auth: {
          username: OCIS_ADMIN_USERNAME,
          password: OCIS_ADMIN_PASSWORD,
        },
        httpsAgent,
      }
    )
  } catch (error) {
    // Handle errors that occur during the request.
    throw error
  }
}

/**
 * Creates a new OcisSpace.
 * @async
 * @function
 * @param {SpacePayload} space - An object containing the properties of the new space to create.
 * @returns {Promise<OcisSpace>} A Promise that resolves with the newly created space object.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const createSpace = async (space: SpacePayload): Promise<OcisSpace> => {
  // Construct the URL to create the space.
  const url = `${OWNCLOUD_BASE_URL}/${OcisApi.LIBRE_GRAPH_API_PATH}/${OcisLibreGraphRoute.DRIVES}`

  try {
    // Send a POST request to create the space.
    const { data }: AxiosResponse<OcisSpace> = await axios.post(
      url,
      {
        name: space.name,
        driveAlias: space.slug,
        description: space.description,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        auth: {
          username: OCIS_ADMIN_USERNAME,
          password: OCIS_ADMIN_PASSWORD,
        },
        httpsAgent,
      }
    )
    return data
  } catch (error) {
    // Handle errors that occur during the request.
    throw error
  }
}

/**
 * Shares an OcisSpace with a user by adding a share entry to the space's sharing settings.
 * @async
 * @function
 * @param {string} spaceId - The UUID of the space to share.
 * @param {string} username - The username of the user to share the space with.
 * @param {Role} role - The role to assign to the user for the shared space.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const shareSpaceWithUser = async (spaceId: string, username: string, role: OcisRole) => {
  // Construct the URL to share the space with the user.
  const url = `${OWNCLOUD_BASE_URL}/${OcisApi.SHARE_API_PATH}`

  try {
    // Send a POST request to share the space with the user.
    await axios.post(
      url,
      `space_ref=${spaceId}&shareType=${OcisShareType.SHARE_SPACE}&shareWith=${username}&role=${role}`,
      {
        auth: {
          username: OCIS_ADMIN_USERNAME,
          password: OCIS_ADMIN_PASSWORD,
        },
        httpsAgent,
      }
    )
  } catch (error) {
    // Handle errors that occur during the request.
    throw error
  }
}
