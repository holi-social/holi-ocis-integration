import { ENVIRONMENT } from '../config'

export const OCIS_INTEGRATION_DB_HOST = process.env.OCIS_INTEGRATION_DB_HOST

export const OCIS_INTEGRATION_DB_NAME = process.env.OCIS_INTEGRATION_DB_NAME

export const OCIS_INTEGRATION_DB_USERNAME = process.env.OCIS_INTEGRATION_DB_USERNAME

export const OCIS_INTEGRATION_DB_PASSWORD = process.env.OCIS_INTEGRATION_DB_PASSWORD

export const OCIS_INTEGRATION_DB_PORT = Number(process.env.OCIS_INTEGRATION_DB_PORT)

const WORKSPACE = 'workspace/'
const ENTITIES_RELATIVE_PATH = 'dist/db/entities/*.entity.js'
const MIGRATIONS_RELATIVE_PATH = 'dist/db/migrations/*.migration.js'

export const ENTITIES_PATH = ENVIRONMENT === 'local' ? ENTITIES_RELATIVE_PATH : WORKSPACE.concat(ENTITIES_RELATIVE_PATH)
export const MIGRATIONS_PATH =
  ENVIRONMENT === 'local' ? MIGRATIONS_RELATIVE_PATH : WORKSPACE.concat(MIGRATIONS_RELATIVE_PATH)

export const APPLICATION_NAME = `holi-ocis-integration-${ENVIRONMENT}`
