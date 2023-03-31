import { ENVIRONMENT } from '../config'

export const OCIS_INTEGRATION_DB_HOST = process.env.OCIS_INTEGRATION_DB_HOST

export const OCIS_INTEGRATION_DB_NAME = process.env.OCIS_INTEGRATION_DB_NAME

export const OCIS_INTEGRATION_DB_USERNAME = process.env.OCIS_INTEGRATION_DB_USERNAME

export const OCIS_INTEGRATION_DB_PASSWORD = process.env.OCIS_INTEGRATION_DB_PASSWORD

export const OCIS_INTEGRATION_DB_PORT = Number(process.env.OCIS_INTEGRATION_DB_PORT)

const ENTITIES_RELATIVE_PATH = 'dist/db/entities/*.entity.js'
const MIGRATIONS_RELATIVE_PATH = 'dist/db/migrations/*.migration.js'

export const ENTITIES_PATH = ENVIRONMENT === 'local' ? ENTITIES_RELATIVE_PATH : '/**/*.entity.js'
export const MIGRATIONS_PATH = ENVIRONMENT === 'local' ? MIGRATIONS_RELATIVE_PATH : '/**/*.migrations.js'

export const APPLICATION_NAME = `holi-ocis-integration-${ENVIRONMENT}`
