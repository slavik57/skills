"use strict";
var config = {
    development: {
        appConfig: {
            hostName: 'localhost',
            port: 443,
            certificate: {
                keyFilePath: '/ssl/development-localhost.key',
                certificateFilePath: '/ssl/development-localhost.cert'
            }
        },
        databbaseConfig: {
            databaseName: 'skills_development',
            databaseUsername: '',
            databasePassword: '',
            databaseHost: ''
        }
    },
    tests: {
        appConfig: {
            hostName: 'localhost',
            port: 443,
            certificate: {
                keyFilePath: '/ssl/development-localhost.key',
                certificateFilePath: '/ssl/development-localhost.cert'
            }
        },
        databbaseConfig: {
            databaseName: 'skills_tests',
            databaseUsername: '',
            databasePassword: '',
            databaseHost: ''
        }
    },
    currentEnvironment: 'tests',
    getCurrentEnvironment: function () {
        var nodeEnviroment = process.env.NODE_ENV;
        if (nodeEnviroment !== undefined) {
            this.currentEnvironment = nodeEnviroment;
        }
        return this[this.currentEnvironment];
    },
};
module.exports = config;
