"use strict";
var userDataHandler_1 = require("./dataHandlers/userDataHandler");
var environmentCleaner_1 = require("./testUtils/environmentCleaner");
var pathHelper_1 = require("../common/pathHelper");
var expressServer_1 = require("./expressServer");
var chai = require('chai');
var chai_1 = require('chai');
var request = require('supertest');
var chaiAsPromised = require('chai-as-promised');
var statusCode_1 = require('./enums/statusCode');
chai.use(chaiAsPromised);
var timeoutForLoadingServer = 100000;
describe('ExpressServer', function () {
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
        return logoutUser();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    function getHomePage() {
        return getPage('home.html');
    }
    function getSigninPage() {
        return getPage('signin.html');
    }
    function getPage(pageName) {
        var webpackMiddleware = expressServer.webpackMiddleware;
        var buffer = webpackMiddleware.fileSystem.readFileSync(pathHelper_1.PathHelper.getPathFromRoot('dist', pageName));
        return new Buffer(buffer).toString();
    }
    function registerUser(userDefinition) {
        return new Promise(function (resolveCallback) {
            server.post('/register')
                .send(userDefinition)
                .end(function () { return resolveCallback(); });
        });
    }
    function loginUser(userDefinition) {
        return new Promise(function (resolveCallback) {
            server.post('/login')
                .send({ username: userDefinition.username, password: userDefinition.password })
                .expect(statusCode_1.StatusCode.REDIRECT)
                .expect('Location', '/')
                .end(function (error, response) {
                resolveCallback();
            });
        });
    }
    function logoutUser() {
        return new Promise(function (resolveCallback) {
            server.get('/logout')
                .end(function (error, response) {
                resolveCallback();
            });
        });
    }
    describe('register', function () {
        it('invalid parameters should fail', function (done) {
            userDefinition.email = 'wrong email';
            server.post('/register')
                .send(userDefinition)
                .expect(statusCode_1.StatusCode.BAD_REQUEST)
                .end(done);
        });
        it('should create redirect to home page', function (done) {
            server.post('/register')
                .send(userDefinition)
                .expect(statusCode_1.StatusCode.REDIRECT)
                .expect('Location', '/')
                .end(done);
        });
        it('should create a user', function (done) {
            server.post('/register')
                .send(userDefinition)
                .end(function () {
                userDataHandler_1.UserDataHandler.getUserByUsername(userDefinition.username)
                    .then(function (_user) {
                    chai_1.expect(_user.attributes.username).to.be.equal(userDefinition.username);
                    done();
                }, function () {
                    chai_1.expect(true, 'should create a user').to.be.false;
                    done();
                });
            });
        });
        it('after register, home should be available', function (done) {
            server.post('/register')
                .send(userDefinition)
                .end(function () {
                server.get('/')
                    .expect(statusCode_1.StatusCode.OK)
                    .expect(getHomePage())
                    .end(done);
            });
        });
    });
    describe('login', function () {
        beforeEach(function () {
            return registerUser(userDefinition);
        });
        it('existing user should secceed and redirect', function (done) {
            server.post('/login')
                .send({ username: userDefinition.username, password: userDefinition.password })
                .expect(statusCode_1.StatusCode.REDIRECT)
                .expect('Location', '/')
                .end(done);
        });
        it('not existing user should fail', function (done) {
            server.post('/login')
                .send({ username: 'not existing username', password: 'some password' })
                .expect(statusCode_1.StatusCode.UNAUTHORIZED).
                end(done);
        });
    });
    describe('user not logged in', function () {
        beforeEach(function () {
            return logoutUser();
        });
        it('home should redirect to signin', function (done) {
            server.get('/')
                .expect(statusCode_1.StatusCode.REDIRECT)
                .expect('Location', '/signin')
                .end(done);
        });
        it('signin should return html page', function (done) {
            server.get('/signin')
                .expect(statusCode_1.StatusCode.OK)
                .expect(getSigninPage())
                .end(done);
        });
        it('logout should succeed', function (done) {
            server.get('/logout')
                .expect(statusCode_1.StatusCode.REDIRECT)
                .expect('Location', '/')
                .end(done);
        });
        it('getting user details should fail', function (done) {
            server.get('/apiuser')
                .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                .end(done);
        });
    });
    describe('user logged in', function () {
        var user;
        beforeEach(function () {
            return registerUser(userDefinition)
                .then(function () { return loginUser(userDefinition); })
                .then(function () { return userDataHandler_1.UserDataHandler.getUserByUsername(userDefinition.username); })
                .then(function (_user) {
                user = _user;
            });
        });
        it('home should return html page', function (done) {
            server.get('/')
                .expect(statusCode_1.StatusCode.OK)
                .expect(getHomePage())
                .end(done);
        });
        it('signin should redirect to home', function (done) {
            server.get('/signin')
                .expect(statusCode_1.StatusCode.REDIRECT)
                .expect('Location', '/')
                .end(done);
        });
        it('logout should succeed', function (done) {
            server.get('/logout')
                .expect(statusCode_1.StatusCode.REDIRECT)
                .expect('Location', '/')
                .end(done);
        });
        it('getting user details should succeed', function (done) {
            var expectedUser = {
                id: user.id,
                username: user.attributes.username
            };
            server.get('/apiuser')
                .expect(statusCode_1.StatusCode.OK)
                .expect(expectedUser)
                .end(done);
        });
        describe('logout', function () {
            beforeEach(function () {
                return logoutUser();
            });
            it('home should redirect to signin', function (done) {
                server.get('/')
                    .expect(statusCode_1.StatusCode.REDIRECT)
                    .expect('Location', '/signin')
                    .end(done);
            });
            it('signin should return html page', function (done) {
                server.get('/signin')
                    .expect(statusCode_1.StatusCode.OK)
                    .expect(getSigninPage())
                    .end(done);
            });
            it('logout should succeed', function (done) {
                server.get('/logout')
                    .expect(statusCode_1.StatusCode.REDIRECT)
                    .expect('Location', '/')
                    .end(done);
            });
            it('getting user details should fail', function (done) {
                server.get('/apiuser')
                    .expect(statusCode_1.StatusCode.UNAUTHORIZED)
                    .end(done);
            });
        });
    });
});
//# sourceMappingURL=expressServer.test.js.map