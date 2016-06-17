"use strict";
var pathHelper_1 = require('./src/common/pathHelper');
var config = {
    development: {
        appConfig: {
            hostName: 'localhost',
            port: 443,
            certificate: {
                keyFilePath: pathHelper_1.PathHelper.getPathFromRoot('ssl', 'development-localhost.key'),
                certificateFilePath: pathHelper_1.PathHelper.getPathFromRoot('ssl', 'development-localhost.cert')
            },
            secret: 'skills_application_secret:712cfb7d-a5fa-4c16-9805-c6da1deb5380',
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
                keyFilePath: pathHelper_1.PathHelper.getPathFromRoot('ssl', 'development-localhost.key'),
                certificateFilePath: pathHelper_1.PathHelper.getPathFromRoot('ssl', 'development-localhost.cert'),
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
    getDbConnectionString: function () {
        var databbaseConfig = config.getCurrentEnvironment().databbaseConfig;
        var connectionString = 'postgres://' +
            databbaseConfig.databaseUsername + ':' +
            databbaseConfig.databasePassword + '@' +
            databbaseConfig.databaseHost + '/' +
            databbaseConfig.databaseName;
        return connectionString;
    }
};
module.exports = config;
//# sourceMappingURL=environment.js.map