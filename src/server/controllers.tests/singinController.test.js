"use strict";
var userLoginManager_1 = require("../testUtils/userLoginManager");
var pageTextResolver_1 = require("../testUtils/pageTextResolver");
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var expressServer_1 = require("../expressServer");
var chai = require('chai');
var request = require('supertest');
var chaiAsPromised = require('chai-as-promised');
var statusCode_1 = require('../enums/statusCode');
chai.use(chaiAsPromised);
var timeoutForLoadingServer = 100000;
describe('SigninController', function () {
    var expressServer;
    var server;
    var userDefinition;
    before(function () {
        this.timeout(timeoutForLoadingServer);
        expressServer = expressServer_1.ExpressServer.instance.initialize();
        server = request.agent(expressServer.expressApp);
    });
    beforeEach(function () {
        this.timeout(timeoutForLoadingServer);
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    beforeEach(function () {
        this.timeout(timeoutForLoadingServer);
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
    describe('register', function () {
        it('after register, signin should redirect', function (done) {
            server.post('/register')
                .send(userDefinition)
                .end(function () {
                server.get('/signin')
                    .expect(statusCode_1.StatusCode.REDIRECT)
                    .expect('Location', '/')
                    .end(done);
            });
        });
    });
    describe('user not logged in', function () {
        beforeEach(function () {
            return userLoginManager_1.UserLoginManager.logoutUser(server);
        });
        it('signin should return correct html', function (done) {
            server.get('/signin')
                .expect(statusCode_1.StatusCode.OK)
                .expect(pageTextResolver_1.PageTextResolver.getSigninPage(expressServer))
                .end(done);
        });
    });
    describe('user logged in', function () {
        beforeEach(function () {
            return userLoginManager_1.UserLoginManager.registerUser(server, userDefinition)
                .then(function () { return userLoginManager_1.UserLoginManager.loginUser(server, userDefinition); });
        });
        it('singin should redirect to home', function (done) {
            server.get('/signin')
                .expect(statusCode_1.StatusCode.REDIRECT)
                .expect('Location', '/')
                .end(done);
        });
        describe('logout', function () {
            beforeEach(function () {
                return userLoginManager_1.UserLoginManager.logoutUser(server);
            });
            it('signin should return correct html', function (done) {
                server.get('/signin')
                    .expect(statusCode_1.StatusCode.OK)
                    .expect(pageTextResolver_1.PageTextResolver.getSigninPage(expressServer))
                    .end(done);
            });
        });
    });
});
//# sourceMappingURL=singinController.test.js.map