"use strict";
var EnvironmentConfig = require("./environment");
var config = {
    development: {
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
};
module.exports = config;
