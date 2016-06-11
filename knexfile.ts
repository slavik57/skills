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
  }
}

config['development'] = config.knexConfig;
config['tests'] = config.knexConfig;

export = config;
