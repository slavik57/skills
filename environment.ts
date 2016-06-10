interface ICertificate {
  keyFilePath: string,
  certificateFilePath: string
}

interface IAppConfig {
  hostName: string;
  port: number;
  certificate: ICertificate;
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

var config = {
  development: <IEnvironmentConfig>{
    appConfig: <IAppConfig>{
      hostName: 'localhost',
      port: 443,
      certificate: {
        keyFilePath: '/ssl/development-localhost.key',
        certificateFilePath: '/ssl/development-localhost.cert'
      }
    },
    databbaseConfig: <IDatabaseConfig>{
      databaseName: 'skills_development',
      databaseUsername: '',
      databasePassword: '',
      databaseHost: ''
    }
  },
  currentEnvironment: 'development',

  getCurrentEnvironment: function(): IEnvironmentConfig {
    return this[this.currentEnvironment];
  }
}

export = config;
