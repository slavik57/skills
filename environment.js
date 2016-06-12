"use strict";
var config = {
    development: {
        appConfig: {
            hostName: 'localhost',
            port: 443,
            certificate: {
                keyFilePath: '/ssl/development-localhost.key',
                certificateFilePath: '/ssl/development-localhost.cert'
            },
            secret: 'skills_application_secret:712cfb7d-a5fa-4c16-9805-c6da1deb5380'
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
            },
            secret: 'skills_application_secret:712cfb7d-a5fa-4c16-9805-c6da1deb5380'
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
