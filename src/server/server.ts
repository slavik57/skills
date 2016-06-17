import {ISessionRequest} from "./passportStrategies/interfaces/iSessionRequest";
import {RegisterStrategy} from "./passportStrategies/registerStrategy";
import {LoginStrategy} from "./passportStrategies/loginStrategy";
import * as express from 'express';
import * as expressHandlebars from 'express-handlebars';
import {Express, Response} from 'express';
import * as bodyParser from 'body-parser';
import * as EnvironmentConfig from "../../environment";
import * as https from 'https';
import * as fs from 'fs';
import * as passport from 'passport';
import * as expressSession from 'express-session';
import {SessionOptions} from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as methodOverride from 'method-override';
var PostgreSqlStore = require('connect-pg-simple')(expressSession);
import {webpackConfig} from '../../webpack.configs/webpack.config';
import * as webpack from 'webpack';
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
import {PathHelper} from '../common/pathHelper';
import * as path from 'path';

var expressControllers = require('express-controller');

var serverDirectory = PathHelper.getPathFromRoot('src', 'server');
var appDirectory = PathHelper.getPathFromRoot('src', 'app');

var app: Express = express();
configureExpress(app);
configureSessionPersistedMessageMiddleware(app);
configureExpressToUseHandleBarsTemplates(app);
configureControllersForApp(app);
configurePassportLoginStrategies(app);
configureWebpack(app);
startApplication(app);

function configureExpress(app: Express) {
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride('X-HTTP-Method-Override'));
  configureSession(app);
  app.use(passport.initialize());
  app.use(passport.session());
}

function configureSession(aoo: Express) {

  var postgreSqlStore = new PostgreSqlStore({
    conString: EnvironmentConfig.getDbConnectionString()
  });

  var options: SessionOptions = {
    secret: EnvironmentConfig.getCurrentEnvironment().appConfig.secret,
    saveUninitialized: true,
    resave: true,
    store: postgreSqlStore
  };

  app.use(expressSession(options));
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
    layoutsDir: path.join(appDirectory, 'views', 'layouts')
  });

  app.engine('handlebars', handlebars.engine);
  app.set('views', path.join(appDirectory, 'views'));
  app.set('view engine', 'handlebars');
}

function configureControllersForApp(app: Express) {
  expressControllers.setDirectory(path.join(serverDirectory, 'controllers'))
    .bind(app);
}

function startApplication(app: Express) {
  var port: number =
    process.env.PORT || EnvironmentConfig.getCurrentEnvironment().appConfig.port;

  var hostName = EnvironmentConfig.getCurrentEnvironment().appConfig.hostName;

  var certificateKeyPath = EnvironmentConfig.getCurrentEnvironment().appConfig.certificate.keyFilePath;
  var certificateFilePath = EnvironmentConfig.getCurrentEnvironment().appConfig.certificate.certificateFilePath;

  var options = {
    key: fs.readFileSync(certificateKeyPath),
    cert: fs.readFileSync(certificateFilePath),
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
  if (req.path.indexOf('/dist/') === 0) {
    return next();
  }

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

function configureWebpack(app: Express) {
  var compiler = webpack(webpackConfig);

  const middleware = webpackMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: 'src/app',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  //
  // app.get('/src/*', function response(req, res) {
  //   console.log(111);
  // });
}
