import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { ENVIRONMENT } from '../config'
import {
  OCIS_INTEGRATION_DB_NAME,
  OCIS_INTEGRATION_DB_HOST,
  OCIS_INTEGRATION_DB_PASSWORD,
  OCIS_INTEGRATION_DB_PORT,
  OCIS_INTEGRATION_DB_USERNAME,
} from './config'

export const IdentityDataSource = new DataSource({
  type: 'postgres',
  host: OCIS_INTEGRATION_DB_HOST,
  port: OCIS_INTEGRATION_DB_PORT,
  username: OCIS_INTEGRATION_DB_USERNAME,
  password: OCIS_INTEGRATION_DB_PASSWORD,
  database: OCIS_INTEGRATION_DB_NAME,
  synchronize: false,
  logging: false,
  entities: ['./dist/db/entities/**/*.js'],
  migrations: ['./dist/db/migrations/**/*{.ts,.js}'],
  applicationName: `holi-ocis-integration-${ENVIRONMENT}`,
  migrationsRun: true,
})

IdentityDataSource.initialize()
  .then(() => {
    console.info('Data Source has been initialized!')
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err)
  })
