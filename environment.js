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
    currentEnvironment: 'development',
    getCurrentEnvironment: function () {
        return this[this.currentEnvironment];
    }
};
module.exports = config;
