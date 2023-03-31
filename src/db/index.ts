import createConnectionPool, { sql } from '@databases/pg'
import tables from '@databases/pg-typed'
import { ENVIRONMENT } from '../config'
import DatabaseSchema from './__generated__'

export { sql }

export const OCIS_INTEGRATION_DB_HOST = process.env.OCIS_INTEGRATION_DB_HOST
export const OCIS_INTEGRATION_DB_NAME = process.env.OCIS_INTEGRATION_DB_NAME
export const OCIS_INTEGRATION_DB_USERNAME = process.env.OCIS_INTEGRATION_DB_USERNAME
export const OCIS_INTEGRATION_DB_PASSWORD = process.env.OCIS_INTEGRATION_DB_PASSWORD

// Configure database to run on Google Cloud SQL
const db =
  ENVIRONMENT === 'local'
    ? createConnectionPool({ bigIntMode: 'number' })
    : createConnectionPool({
        bigIntMode: 'number',
        user: OCIS_INTEGRATION_DB_USERNAME,
        password: OCIS_INTEGRATION_DB_PASSWORD,
        database: OCIS_INTEGRATION_DB_NAME,
        host: OCIS_INTEGRATION_DB_HOST,
      })
export default db

// You can list whatever tables you actually have here:
const { user_mapping: UserMapping, space_mapping: SpaceMapping } = tables<DatabaseSchema>({
  databaseSchema: require('./__generated__/schema.json'),
})
export { UserMapping, SpaceMapping }
