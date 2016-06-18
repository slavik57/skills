"use strict";
var statusCode_1 = require("./enums/statusCode");
var registerStrategy_1 = require("./passportStrategies/registerStrategy");
var loginStrategy_1 = require("./passportStrategies/loginStrategy");
var logoutStrategy_1 = require("./passportStrategies/logoutStrategy");
var pathHelper_1 = require("../common/pathHelper");
var webpack_config_1 = require('./webpack.configs/webpack.config');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var passport = require('passport');
var expressSession = require('express-session');
var EnvironmentConfig = require("../../environment");
var path = require('path');
var webpack = require('webpack');
var https = require('https');
var fs = require('fs');
var PostgreSqlStore = require('connect-pg-simple')(expressSession);
var expressControllers = require('express-controller');
var webpackMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var ExpressServer = (function () {
    function ExpressServer() {
        this._serverDirectory = pathHelper_1.PathHelper.getPathFromRoot('src', 'server');
        this._expressApp = express();
    }
    Object.defineProperty(ExpressServer.prototype, "expressApp", {
        get: function () {
            return this._expressApp;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ExpressServer.prototype, "webpackMiddleware", {
        get: function () {
            return this._webpackMiddleware;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ExpressServer, "instance", {
        get: function () {
            if (!this._instance) {
                console.log('Creating express server instance');
                this._instance = new ExpressServer();
            }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    ExpressServer.prototype.initialize = function () {
        this._configureExpress();
        this._configureWebpack();
        return this;
    };
    ExpressServer.prototype.start = function () {
        var _this = this;
        var port = process.env.PORT || EnvironmentConfig.getCurrentEnvironment().appConfig.port;
        var hostName = EnvironmentConfig.getCurrentEnvironment().appConfig.hostName;
        var certificateKeyPath = EnvironmentConfig.getCurrentEnvironment().appConfig.certificate.keyFilePath;
        var certificateFilePath = EnvironmentConfig.getCurrentEnvironment().appConfig.certificate.certificateFilePath;
        var options = {
            key: fs.readFileSync(certificateKeyPath),
            cert: fs.readFileSync(certificateFilePath),
        };
        var server = https.createServer(options, this._expressApp)
            .listen(port, hostName, function () { return _this._logServerIsUp(server.address()); });
        return server;
    };
    ExpressServer.prototype._configureExpress = function () {
        this._expressApp.use(cookieParser());
        this._expressApp.use(bodyParser.urlencoded({ extended: false }));
        this._expressApp.use(bodyParser.json());
        this._expressApp.use(methodOverride('X-HTTP-Method-Override'));
        this._configureSession();
        this._configurePassport();
        this._configureSessionPersistedMessageMiddleware();
        this._configureControllersForApp();
        this._configurePassportLoginStrategies();
    };
    ExpressServer.prototype._configureSession = function () {
        var postgreSqlStore = new PostgreSqlStore({
            conString: EnvironmentConfig.getDbConnectionString()
        });
        var options = {
            secret: EnvironmentConfig.getCurrentEnvironment().appConfig.secret,
            saveUninitialized: true,
            resave: true,
            store: postgreSqlStore
        };
        this._expressApp.use(expressSession(options));
    };
    ExpressServer.prototype._configurePassport = function () {
        this._expressApp.use(passport.initialize());
        this._expressApp.use(passport.session());
    };
    ExpressServer.prototype._configureSessionPersistedMessageMiddleware = function () {
        this._expressApp.use(function (req, res, next) {
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
    };
    ExpressServer.prototype._configureControllersForApp = function () {
        expressControllers.setDirectory(path.join(this._serverDirectory, 'controllers'))
            .bind(this._expressApp);
    };
    ExpressServer.prototype._configurePassportLoginStrategies = function () {
        var _this = this;
        loginStrategy_1.LoginStrategy.initialize(this._expressApp);
        logoutStrategy_1.LogoutStrategy.initialize(this._expressApp);
        registerStrategy_1.RegisterStrategy.initialize(this._expressApp);
        passport.serializeUser(function (user, done) { done(null, user); });
        passport.deserializeUser(function (obj, done) { done(null, obj); });
        this._expressApp.use(function (request, response, nextFunction) { return _this._ensureAuthenticated(request, response, nextFunction); });
    };
    ExpressServer.prototype._ensureAuthenticated = function (request, response, nextFunction) {
        if (request.isAuthenticated()) {
            request.path === '/signin' ? response.redirect('/') : nextFunction();
            return;
        }
        if (request.path.indexOf('/dist/') === 0) {
            nextFunction();
            return;
        }
        if (request.path === '/signin') {
            nextFunction();
            return;
        }
        if (request.path.indexOf('/api') === 0) {
            response.status(statusCode_1.StatusCode.UNAUTHORIZED).send();
            return;
        }
        response.redirect('/signin');
    };
    ExpressServer.prototype._configureWebpack = function () {
        var compiler = webpack(webpack_config_1.webpackConfig);
        this._webpackMiddleware = webpackMiddleware(compiler, {
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
        this._expressApp.use(this._webpackMiddleware);
        this._expressApp.use(webpackHotMiddleware(compiler));
    };
    ExpressServer.prototype._logServerIsUp = function (serverAddress) {
        var host = serverAddress.address;
        var port = serverAddress.port;
        console.log("Server is listening at host: %s and port: %s", host, port);
    };
    return ExpressServer;
}());
exports.ExpressServer = ExpressServer;
//# sourceMappingURL=expressServer.js.map