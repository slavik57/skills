// Update with your config settings.
import { Config } from "knex";
import * as EnvironmentConfig from "./environment";

var config = {
  knexConfig: <Config>{
    client: 'postgresql',
    connection: {
      database: EnvironmentConfig.getCurrentEnvironment().databbaseConfig.databaseName,
      user: EnvironmentConfig.getCurrentEnvironment().databbaseConfig.databaseUsername,
      password: EnvironmentConfig.getCurrentEnvironment().databbaseConfig.databasePassword,
      host: EnvironmentConfig.getCurrentEnvironment().databbaseConfig.databaseHost
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  development: <Config>{
    client: 'postgresql',
    connection: {
      database: EnvironmentConfig.development.databbaseConfig.databaseName,
      user: EnvironmentConfig.development.databbaseConfig.databaseUsername,
      password: EnvironmentConfig.development.databbaseConfig.databasePassword,
      host: EnvironmentConfig.development.databbaseConfig.databaseHost
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  tests: <Config>{
    client: 'postgresql',
    connection: {
      database: EnvironmentConfig.tests.databbaseConfig.databaseName,
      user: EnvironmentConfig.tests.databbaseConfig.databaseUsername,
      password: EnvironmentConfig.tests.databbaseConfig.databasePassword,
      host: EnvironmentConfig.tests.databbaseConfig.databaseHost
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
}

export = config;
