import * as express from 'express';
import * as expressHandlebars from 'express-handlebars';
import {Express} from 'express';
import * as bodyParser from 'body-parser';
import * as EnvironmentConfig from "../environment";
import * as https from 'https';
import * as fs from 'fs';
var expressControllers = require('express-controller');

var currentFileDirectory = __dirname;

var app: Express = express();
configureExpress(app);
configureSessionPersistedMessageMiddleware(app);
configureExpressToUseHandleBarsTemplates(app);
configureControllersForApp(app);
startApplication(app);

function configureExpress(app: Express) {
  // app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  // app.use(methodOverride('X-HTTP-Method-Override'));
  // app.use(session({ secret: 'supernova', saveUninitialized: true, resave: true }));
  // app.use(passport.initialize());
  // app.use(passport.session());
}

function configureControllersForApp(app: Express) {
  expressControllers.setDirectory(currentFileDirectory + '/controllers')
    .bind(app);
}

function configureSessionPersistedMessageMiddleware(app: Express) {
  // app.use(function(req, res, next) {
  //   var err = req.session.error,
  //     msg = req.session.notice,
  //     success = req.session.success;
  //
  //   delete req.session.error;
  //   delete req.session.success;
  //   delete req.session.notice;
  //
  //   if (err) res.locals.error = err;
  //   if (msg) res.locals.notice = msg;
  //   if (success) res.locals.success = success;
  //
  //   next();
  // });
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

function serverIsUpCallback(serverAddress: { address: string, port: number }) {
  var host = serverAddress.address;
  var port = serverAddress.port;
  console.log("App listening at host: %s and port: %s", host, port);
}
