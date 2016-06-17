"use strict";
var registerStrategy_1 = require("./passportStrategies/registerStrategy");
var loginStrategy_1 = require("./passportStrategies/loginStrategy");
var express = require('express');
var expressHandlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var EnvironmentConfig = require("../../environment");
var https = require('https');
var fs = require('fs');
var passport = require('passport');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var PostgreSqlStore = require('connect-pg-simple')(expressSession);
var webpack_config_1 = require('./webpack.configs/webpack.config');
var webpack = require('webpack');
var webpackMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var pathHelper_1 = require('../common/pathHelper');
var path = require('path');
var expressControllers = require('express-controller');
var serverDirectory = pathHelper_1.PathHelper.getPathFromRoot('src', 'server');
var appDirectory = pathHelper_1.PathHelper.getPathFromRoot('src', 'app');
var app = express();
configureExpress(app);
configureSessionPersistedMessageMiddleware(app);
configureExpressToUseHandleBarsTemplates(app);
configureControllersForApp(app);
configurePassportLoginStrategies(app);
configureWebpack(app);
startApplication(app);
function configureExpress(app) {
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(methodOverride('X-HTTP-Method-Override'));
    configureSession(app);
    app.use(passport.initialize());
    app.use(passport.session());
}
function configureSession(aoo) {
    var postgreSqlStore = new PostgreSqlStore({
        conString: EnvironmentConfig.getDbConnectionString()
    });
    var options = {
        secret: EnvironmentConfig.getCurrentEnvironment().appConfig.secret,
        saveUninitialized: true,
        resave: true,
        store: postgreSqlStore
    };
    app.use(expressSession(options));
}
function configureSessionPersistedMessageMiddleware(app) {
    app.use(function (req, res, next) {
        var err = req.session.error, msg = req.session.notice, success = req.session.success;
        delete req.session.error;
        delete req.session.success;
        delete req.session.notice;
        if (err)
            res.locals.error = err;
        if (msg)
            res.locals.notice = msg;
        if (success)
            res.locals.success = success;
        next();
    });
}
function configureExpressToUseHandleBarsTemplates(app) {
    var handlebars = expressHandlebars.create({
        defaultLayout: 'main',
        layoutsDir: path.join(appDirectory, 'views', 'layouts')
    });
    app.engine('handlebars', handlebars.engine);
    app.set('views', path.join(appDirectory, 'views'));
    app.set('view engine', 'handlebars');
}
function configureControllersForApp(app) {
    expressControllers.setDirectory(path.join(serverDirectory, 'controllers'))
        .bind(app);
}
function startApplication(app) {
    var port = process.env.PORT || EnvironmentConfig.getCurrentEnvironment().appConfig.port;
    var hostName = EnvironmentConfig.getCurrentEnvironment().appConfig.hostName;
    var certificateKeyPath = EnvironmentConfig.getCurrentEnvironment().appConfig.certificate.keyFilePath;
    var certificateFilePath = EnvironmentConfig.getCurrentEnvironment().appConfig.certificate.certificateFilePath;
    var options = {
        key: fs.readFileSync(certificateKeyPath),
        cert: fs.readFileSync(certificateFilePath),
    };
    var server = https.createServer(options, app)
        .listen(port, hostName, function () { return serverIsUpCallback(server.address()); });
}
function configurePassportLoginStrategies(app) {
    loginStrategy_1.LoginStrategy.initialize(app);
    registerStrategy_1.RegisterStrategy.initialize(app);
    passport.serializeUser(function (user, done) { done(null, user); });
    passport.deserializeUser(function (obj, done) { done(null, obj); });
    app.use(ensureAuthenticated);
}
function ensureAuthenticated(req, res, next) {
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
function serverIsUpCallback(serverAddress) {
    var host = serverAddress.address;
    var port = serverAddress.port;
    console.log("App listening at host: %s and port: %s", host, port);
}
function configureWebpack(app) {
    var compiler = webpack(webpack_config_1.webpackConfig);
    var middleware = webpackMiddleware(compiler, {
        publicPath: webpack_config_1.webpackConfig.output.publicPath,
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
}
//# sourceMappingURL=server.js.map