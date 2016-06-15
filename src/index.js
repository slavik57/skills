"use strict";
var registerStrategy_1 = require("./passportStrategies/registerStrategy");
var loginStrategy_1 = require("./passportStrategies/loginStrategy");
var express = require('express');
var expressHandlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var EnvironmentConfig = require("../environment");
var https = require('https');
var fs = require('fs');
var passport = require('passport');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var PostgreSqlStore = require('connect-pg-simple')(expressSession);
var expressControllers = require('express-controller');
var currentFileDirectory = __dirname;
var app = express();
configureExpress(app);
configureSessionPersistedMessageMiddleware(app);
configureExpressToUseHandleBarsTemplates(app);
configureControllersForApp(app);
configurePassportLoginStrategies(app);
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
        layoutsDir: currentFileDirectory + '/views/layouts'
    });
    app.engine('handlebars', handlebars.engine);
    app.set('views', currentFileDirectory + '/views');
    app.set('view engine', 'handlebars');
}
function configureControllersForApp(app) {
    expressControllers.setDirectory(currentFileDirectory + '/controllers')
        .bind(app);
}
function startApplication(app) {
    var port = process.env.PORT || EnvironmentConfig.getCurrentEnvironment().appConfig.port;
    var hostName = EnvironmentConfig.getCurrentEnvironment().appConfig.hostName;
    var certificateKeyPath = EnvironmentConfig.getCurrentEnvironment().appConfig.certificate.keyFilePath;
    var certificateFilePath = EnvironmentConfig.getCurrentEnvironment().appConfig.certificate.certificateFilePath;
    var options = {
        key: fs.readFileSync(currentFileDirectory + '/..' + certificateKeyPath),
        cert: fs.readFileSync(currentFileDirectory + '/..' + certificateFilePath),
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
