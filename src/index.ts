import {ISessionRequest} from "./passportStrategies/interfaces/iSessionRequest";
import {RegisterStrategy} from "./passportStrategies/registerStrategy";
import {LoginStrategy} from "./passportStrategies/loginStrategy";
import * as express from 'express';
import * as expressHandlebars from 'express-handlebars';
import {Express, Response} from 'express';
import * as bodyParser from 'body-parser';
import * as EnvironmentConfig from "../environment";
import * as https from 'https';
import * as fs from 'fs';
import * as passport from 'passport';
import * as expressSession from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as methodOverride from 'method-override';

var expressControllers = require('express-controller');

var currentFileDirectory = __dirname;

var app: Express = express();
configureExpress(app);
configureSessionPersistedMessageMiddleware(app);
configureExpressToUseHandleBarsTemplates(app);
configureControllersForApp(app);
configurePassportLoginStrategies(app);
startApplication(app);

function configureExpress(app: Express) {
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride('X-HTTP-Method-Override'));
  app.use(expressSession({ secret: EnvironmentConfig.getCurrentEnvironment().appConfig.secret, saveUninitialized: true, resave: true }));
  app.use(passport.initialize());
  app.use(passport.session());
}

function configureSessionPersistedMessageMiddleware(app: Express) {
  app.use((req: any, res: any, next) => {
    var err = req.session.error,
      msg = req.session.notice,
      success = req.session.success;

    delete req.session.error;
    delete req.session.success;
    delete req.session.notice;

    if (err) res.locals.error = err;
    if (msg) res.locals.notice = msg;
    if (success) res.locals.success = success;

    next();
  });
}

function configureExpressToUseHandleBarsTemplates(app: Express) {
  var handlebars: Exphbs = expressHandlebars.create({
    defaultLayout: 'main',
    layoutsDir: currentFileDirectory + '/views/layouts'
  });

  app.engine('handlebars', handlebars.engine);
  app.set('views', currentFileDirectory + '/views');
  app.set('view engine', 'handlebars');
}

function configureControllersForApp(app: Express) {
  expressControllers.setDirectory(currentFileDirectory + '/controllers')
    .bind(app);
}

function startApplication(app: Express) {
  var port: number =
    process.env.PORT || EnvironmentConfig.getCurrentEnvironment().appConfig.port;

  var hostName = EnvironmentConfig.getCurrentEnvironment().appConfig.hostName;

  var certificateKeyPath = EnvironmentConfig.getCurrentEnvironment().appConfig.certificate.keyFilePath;
  var certificateFilePath = EnvironmentConfig.getCurrentEnvironment().appConfig.certificate.certificateFilePath;

  var options = {
    key: fs.readFileSync(currentFileDirectory + '/..' + certificateKeyPath),
    cert: fs.readFileSync(currentFileDirectory + '/..' + certificateFilePath),
  };

  var server = https.createServer(options, app)
    .listen(port, hostName, () => serverIsUpCallback(server.address()));
}

function configurePassportLoginStrategies(app: Express) {
  LoginStrategy.initialize(app);
  RegisterStrategy.initialize(app);

  passport.serializeUser((user, done) => { done(null, user); });
  passport.deserializeUser((obj, done) => { done(null, obj); });

  app.use(ensureAuthenticated);
}

function ensureAuthenticated(req: ISessionRequest, res: Response, next) {
  if (!req.isAuthenticated() && req.path === '/signin') {
    return next();
  }

  if (req.isAuthenticated() && req.path === '/signin') {
    res.redirect('/');
    return;
  }

  if (req.isAuthenticated()) {
    return next();
  }

  req.session.error = 'Please sign in!';
  res.redirect('/signin');
}

function serverIsUpCallback(serverAddress: { address: string, port: number }) {
  var host = serverAddress.address;
  var port = serverAddress.port;
  console.log("App listening at host: %s and port: %s", host, port);
}
