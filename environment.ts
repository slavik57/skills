import {PathHelper} from './src/common/pathHelper';

interface ICertificate {
  keyFilePath: string,
  certificateFilePath: string
}

interface IAppConfig {
  hostName: string;
  port: number;
  certificate: ICertificate;
  secret: string;
}

interface IDatabaseConfig {
  databaseName: string;
  databaseUsername: string;
  databasePassword: string;
  databaseHost: string;
}

interface IEnvironmentConfig {
  appConfig: IAppConfig;
  databbaseConfig: IDatabaseConfig;
}

interface IConfig {
  development: IEnvironmentConfig;
  production: IEnvironmentConfig;
  tests: IEnvironmentConfig;

  currentEnvironment: string;

  getCurrentEnvironment: () => IEnvironmentConfig;

  getDbConnectionString: () => string;
}

var config: IConfig = {
  development: {
    appConfig: {
      hostName: 'localhost',
      port: 8021,
      certificate: {
        keyFilePath: PathHelper.getPathFromRoot('ssl', 'development-localhost.key'),
        certificateFilePath: PathHelper.getPathFromRoot('ssl', 'development-localhost.cert')
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
  production: {
    appConfig: {
      hostName: 'localhost',
      port: 8021,
      certificate: {
        keyFilePath: PathHelper.getPathFromRoot('ssl', 'development-localhost.key'),
        certificateFilePath: PathHelper.getPathFromRoot('ssl', 'development-localhost.cert')
      },
      secret: 'skills_application_secret:712cfb7d-a5fa-4c16-9805-c6da1deb5380',
    },
    databbaseConfig: {
      databaseName: 'skills_production',
      databaseUsername: '',
      databasePassword: '',
      databaseHost: ''
    }
  },
  tests: {
    appConfig: {
      hostName: 'localhost',
      port: 8021,
      certificate: {
        keyFilePath: PathHelper.getPathFromRoot('ssl', 'development-localhost.key'),
        certificateFilePath: PathHelper.getPathFromRoot('ssl', 'development-localhost.cert'),
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

  getCurrentEnvironment: function(): IEnvironmentConfig {
    var nodeEnviroment = process.env.NODE_ENV;
    if (nodeEnviroment !== undefined) {
      this.currentEnvironment = nodeEnviroment;
    }

    return this[this.currentEnvironment];
  },

  getDbConnectionString: function(): string {
    var databbaseConfig: IDatabaseConfig =
      config.getCurrentEnvironment().databbaseConfig;

    var connectionString =
      'postgres://' +
      databbaseConfig.databaseUsername + ':' +
      databbaseConfig.databasePassword + '@' +
      databbaseConfig.databaseHost + '/' +
      databbaseConfig.databaseName;

    return connectionString;
  }
}

export = config;
