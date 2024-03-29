import {CreateAdminUserOperation} from "./operations/userOperations/createAdminUserOperation";
import {User} from "./models/user";
import {StatusCode} from "./enums/statusCode";
import {RegisterStrategy} from "./passportStrategies/registerStrategy";
import {LoginStrategy} from "./passportStrategies/loginStrategy";
import {LogoutStrategy} from "./passportStrategies/logoutStrategy";
import {PathHelper} from "../common/pathHelper";
import {Express, Request, Response, NextFunction} from 'express';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as methodOverride from 'method-override';
import * as passport from 'passport';
import * as expressSession from 'express-session';
import {SessionOptions} from 'express-session';
import * as EnvironmentConfig from "../../environment";
import * as path from 'path';
import * as https from 'https';
import {Server} from 'net';
import * as fs from 'fs';
import * as bluebirdPromise from 'bluebird';
const PostgreSqlStore = require('connect-pg-simple')(expressSession);
const expressControllers = require('express-controller');

export class ExpressServer {

  private static _instance: ExpressServer;
  private _serverDirectory: string;
  private _expressApp: Express;
  private _isInitialized: boolean;

  constructor() {
    this._isInitialized = false;

    this._serverDirectory = PathHelper.getPathFromRoot('src', 'server');
    this._expressApp = express();
  }

  public get expressApp(): Express {
    return this._expressApp;
  }

  public static get instance(): ExpressServer {
    if (!this._instance) {
      console.log('Creating express server instance');
      this._instance = new ExpressServer();
    }

    return this._instance;
  }

  public initialize(): Promise<ExpressServer> {
    return this._initializeAdmin()
      .then(() => this._initializeExpressServer());
  }

  public start(): Server {
    var port: number =
      process.env.PORT || EnvironmentConfig.getCurrentEnvironment().appConfig.port;

    var hostName = EnvironmentConfig.getCurrentEnvironment().appConfig.hostName;

    var certificateKeyPath = EnvironmentConfig.getCurrentEnvironment().appConfig.certificate.keyFilePath;
    var certificateFilePath = EnvironmentConfig.getCurrentEnvironment().appConfig.certificate.certificateFilePath;

    var options = {
      key: fs.readFileSync(certificateKeyPath),
      cert: fs.readFileSync(certificateFilePath),
    };

    var server: Server = https.createServer(options, this._expressApp)
      .listen(port, hostName, () => this._logServerIsUp(server.address()));

    return server;
  }

  private _initializeAdmin(): bluebirdPromise<User> {
    var createAdminUserOperation = new CreateAdminUserOperation();

    return createAdminUserOperation.execute().catch(() => { });
  }

  private _initializeExpressServer(): ExpressServer {
    if (!this._isInitialized) {
      this._configureExpress();

      this._isInitialized = true;
    }

    return this;
  }

  private _configureExpress() {
    this._expressApp.use(cookieParser());
    this._expressApp.use(bodyParser.urlencoded({ extended: false }));
    this._expressApp.use(bodyParser.json());
    this._expressApp.use(methodOverride('X-HTTP-Method-Override'));
    this._configureSession();
    this._configurePassport();
    this._configureControllersForApp();
    this._configurePassportLoginStrategies();
  }

  private _configureSession() {
    var postgreSqlStore = new PostgreSqlStore({
      conString: EnvironmentConfig.getDbConnectionString()
    });

    var options: SessionOptions = {
      secret: EnvironmentConfig.getCurrentEnvironment().appConfig.secret,
      saveUninitialized: true,
      resave: true,
      store: postgreSqlStore
    };

    this._expressApp.use(expressSession(options));
  }

  private _configurePassport() {
    this._expressApp.use(passport.initialize());
    this._expressApp.use(passport.session());
  }

  private _configureControllersForApp() {
    expressControllers.setDirectory(path.join(this._serverDirectory, 'controllers'))
      .bind(this._expressApp);
  }

  private _configurePassportLoginStrategies() {
    LoginStrategy.initialize(this._expressApp);
    LogoutStrategy.initialize(this._expressApp);
    RegisterStrategy.initialize(this._expressApp);

    passport.serializeUser((user, done) => { done(null, user); });
    passport.deserializeUser((obj, done) => { done(null, obj); });
  }



  private _logServerIsUp(serverAddress: { address: string, port: number }) {
    var host = serverAddress.address;
    var port = serverAddress.port;
    console.log("Server is listening at host: %s and port: %s", host, port);
  }
}
