"use strict";
var userLoginManager_1 = require("../testUtils/userLoginManager");
var pageTextResolver_1 = require("../testUtils/pageTextResolver");
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var expressServer_1 = require("../expressServer");
var chai = require('chai');
var supertest = require('supertest');
var chaiAsPromised = require('chai-as-promised');
var statusCode_1 = require('../enums/statusCode');
var testConfigurations_1 = require('../../../testConfigurations');
chai.use(chaiAsPromised);
describe('HomeController', function () {
    var expressServer;
    var server;
    var userDefinition;
    before(function (done) {
        this.timeout(testConfigurations_1.webpackInitializationTimeout);
        expressServer_1.ExpressServer.instance.initialize()
            .then(function (_expressServer) {
            expressServer = _expressServer;
            server = supertest.agent(expressServer.expressApp);
            done();
        });
    });
    beforeEach(function () {
        this.timeout(testConfigurations_1.webpackInitializationTimeout);
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    beforeEach(function () {
        this.timeout(testConfigurations_1.webpackInitializationTimeout);
        userDefinition = {
            username: 'someUser',
            password: 'somePassword',
            email: 'a@gmail.com',
            firstName: 'first name',
            lastName: 'last name'
        };
        return userLoginManager_1.UserLoginManager.logoutUser(server);
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('user not logged in', function () {
        beforeEach(function () {
            return userLoginManager_1.UserLoginManager.logoutUser(server);
        });
        it('home should redirect to signin', function (done) {
            server.get('/')
                .expect(statusCode_1.StatusCode.REDIRECT)
                .expect('Location', '/signin')
                .end(done);
        });
    });
    describe('user registered', function () {
        it('home should return correct html page', function (done) {
            server.post('/register')
                .send(userDefinition)
                .end(function () {
                server.get('/')
                    .expect(statusCode_1.StatusCode.OK)
                    .expect(pageTextResolver_1.PageTextResolver.getHomePage(expressServer))
                    .end(done);
            });
        });
        describe('logout', function () {
            beforeEach(function () {
                return userLoginManager_1.UserLoginManager.logoutUser(server);
            });
            it('home should redirect to signin', function (done) {
                server.get('/')
                    .expect(statusCode_1.StatusCode.REDIRECT)
                    .expect('Location', '/signin')
                    .end(done);
            });
        });
    });
    describe('user logged in', function () {
        beforeEach(function () {
            return userLoginManager_1.UserLoginManager.registerUser(server, userDefinition)
                .then(function () { return userLoginManager_1.UserLoginManager.loginUser(server, userDefinition); });
        });
        it('home should return html page', function (done) {
            server.get('/')
                .expect(statusCode_1.StatusCode.OK)
                .expect(pageTextResolver_1.PageTextResolver.getHomePage(expressServer))
                .end(done);
        });
        describe('logout', function () {
            beforeEach(function () {
                return userLoginManager_1.UserLoginManager.logoutUser(server);
            });
            it('home should redirect to signin', function (done) {
                server.get('/')
                    .expect(statusCode_1.StatusCode.REDIRECT)
                    .expect('Location', '/signin')
                    .end(done);
            });
        });
    });
});
//# sourceMappingURL=homeController.test.js.map