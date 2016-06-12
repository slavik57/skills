"use strict";
var express = require('express');
var expressHandlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var EnvironmentConfig = require("../environment");
var https = require('https');
var fs = require('fs');
var currentFileDirectory = __dirname;
var app = express();
configureExpress(app);
configureSessionPersistedMessageMiddleware(app);
configureExpressToUseHandleBarsTemplates(app);
configureRoutes(app);
startApplication(app);
function configureExpress(app) {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
}
function configureSessionPersistedMessageMiddleware(app) {
}
function configureExpressToUseHandleBarsTemplates(app) {
    var handlebars = expressHandlebars.create({
        defaultLayout: 'main',
        layoutsDir: 'src/views/layouts'
    });
    app.engine('handlebars', handlebars.engine);
    app.set('views', 'src/views');
    app.set('views', 'src/views');
    app.set('view engine', 'handlebars');
}
function configureRoutes(app) {
    app.get('/', function (req, res) {
        res.render('home', { user: req.user });
    });
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
function serverIsUpCallback(serverAddress) {
    var host = serverAddress.address;
    var port = serverAddress.port;
    console.log("App listening at host: %s and port: %s", host, port);
}
