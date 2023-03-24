/**
 * Payload for a user
 *
 * @typedef {Object} UserPayload
 * @property {string} id - The unique identifier of the user
 * @property {string} email - The email address of the user
 * @property {string} name - The name of the user
 */
export type UserPayload = {
  id: string
  email: string
  name: string
}

/**
 * Payload for a space
 *
 * @typedef {Object} SpacePayload
 * @property {string} id - The unique identifier of the space
 * @property {string} name - The name of the space
 * @property {string} slug - The slug of the space
 * @property {string} description - The description of the space
 */
export type SpacePayload = {
  id: string
  name: string
  slug: string
  description: string
}

/**
 * Payload for data created when a space is created
 *
 * @typedef {Object} SpaceCreatedDataPayload
 * @property {UserPayload} user - The user who created the space
 * @property {SpacePayload} space - The created space
 */
export type SpaceCreatedDataPayload = {
  user: UserPayload
  space: SpacePayload
}

/**
 * Enumeration of oCIS API paths
 *
 * @readonly
 * @enum {string}
 * @property {string} LIBRE_GRAPH_API_PATH - Path for the Libre Graph API
 * @property {string} SHARE_API_PATH - Path for the Share API
 * @property {string} SETTINGS_API_PATH - Path for the Settings API
 */
export enum OcisApi {
  LIBRE_GRAPH_API_PATH = 'graph/v1.0',
  SHARE_API_PATH = 'ocs/v2.php/apps/files_sharing/api/v1/shares',
  SETTINGS_API_PATH = 'api/v0/settings',
}

/**
 * Enumeration of the Libre Graph routes
 *
 * @readonly
 * @enum {string}
 * @property {string} USERS - The users route
 * @property {string} DRIVES - The drives route
 * @property {string} GROUPS - The groups route
 * @property {string} MEMBERS - The members route
 */
export enum OcisLibreGraphRoute {
  USERS = 'users',
  DRIVES = 'drives',
  GROUPS = 'groups',
  MEMBERS = 'members',
}

/**
 * Enumeration of oCIS user types
 *
 * @readonly
 * @enum {string}
 * @property {string} MEMBER - The member user type
 * @property {string} GUEST - The guest user type
 */
export enum OcisUserType {
  MEMBER = 'Member',
  GUEST = 'Guest',
}

/**
 * Enumeration of default UUID roles in oCIS.
 * https://github.com/owncloud/ocis/blob/40ab22195d0f9c48b55e8d9133965bb46f8bc90c/services/settings/pkg/store/defaults/defaults.go#L13
 *
 * @readonly
 * @enum {string}
 * @property {string} SPACE_ADMIN - The UUID for the Space Admin role.
 */
export enum OcisDefaultUUIDRole {
  SPACE_ADMIN = '2aadd357-682c-406b-8874-293091995fdd',
}

/**
 * Enumeration of oCIS roles
 *
 * @readonly
 * @enum {string}
 * @property {string} VIEWER - The viewer role
 * @property {string} EDITOR - The editor role
 * @property {string} MANAGER - The manager role
 */
export enum OcisRole {
  VIEWER = 'viewer',
  EDITOR = 'editor',
  MANAGER = 'manager',
}

/**
 * Enumeration of oCIS share types
 *
 * @readonly
 * @enum {number}
 * @property {number} SHARE_SPACE - The share space type
 */
export enum OcisShareType {
  SHARE_SPACE = 7,
}

/**
 * Represents a user in the oCIS system.
 *
 * @typedef {Object} OcisUser
 * @property {string} id - The unique identifier of the user.
 * @property {boolean} accountEnabled - Whether the user's account is enabled.
 * @property {string} displayName - The display name of the user.
 * @property {string} givenName - The given name of the user.
 * @property {string} mail - The email address of the user.
 * @property {string} onPremisesSamAccountName - The SAM account name of the user.
 * @property {string} surname - The surname of the user.
 * @property {string} userType - The type of user.
 */
export type OcisUser = {
  id: string
  accountEnabled: boolean
  displayName: string
  givenName: string
  mail: string
  onPremisesSamAccountName: string
  surname: string
  userType: string
}

/**
 * Represents the root folder of a space in oCIS.
 *
 * @typedef {Object} OcisSpaceRoot
 * @property {string} eTag - The ETag of the root folder.
 * @property {string} id - The unique identifier of the root folder.
 * @property {Object[]} permissions - The permissions for the root folder.
 * @property {Object[]} permissions.grantedToIdentities - The identities granted permission to the root folder.
 * @property {Object} permissions.grantedToIdentities.user - The user identity granted permission to the root folder.
 * @property {string[]} permissions.roles - The roles granted to the identities.
 * @property {string} webDavUrl - The WebDAV URL of the root folder.
 */
type OcisSpaceRoot = {
  eTag: string
  id: string
  permissions: [
    {
      grantedToIdentities: [
        {
          user: {
            displayName: string
            id: string
          }
        }
      ]
      roles: string[]
    }
  ]
  webDavUrl: string
}

/**
 * Represents the quota of a space in oCIS.
 *
 * @typedef {Object} OcisSpaceQuota
 * @property {number} remaining - The remaining space available in bytes.
 * @property {string} state - The state of the quota.
 * @property {number} total - The total space available in bytes.
 * @property {number} used - The space used in bytes.
 */
type OcisSpaceQuota = {
  remaining: number
  state: string
  total: number
  used: number
}

/**
 * Represents the owner of a space in oCIS.
 *
 * @typedef {Object} OcisSpaceOwner
 * @property {Object} user - The user that owns the space.
 * @property {string} user.displayName - The display name of the user.
 * @property {string} user.id - The unique identifier of the user.
 */
type OcisSpaceOwner = {
  user: {
    displayName: string
    id: string
  }
}

/**
 * Represents a space in oCIS.
 *
 * @typedef {Object} OcisSpace
 * @property {string} driveAlias - The alias of the drive.
 * @property {string} driveType - The type of the drive.
 * @property {string} id - The unique identifier of the space.
 * @property {string} lastModifiedDateTime - The date and time the space was last modified.
 * @property {string} name - The name of the space.
 * @property {OcisSpaceOwner} owner - The owner of the space.
 * @property {OcisSpaceQuota} quota - The quota of the space.
 * @property {OcisSpaceRoot} root - The root folder of the space.
 * @property {string} webUrl - The URL of the space.
 */
export type OcisSpace = {
  driveAlias: string
  driveType: string
  id: string
  lastModifiedDateTime: string
  name: string
  owner: OcisSpaceOwner
  quota: OcisSpaceQuota
  root: OcisSpaceRoot
  webUrl: string
}
