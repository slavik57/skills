"use strict";
var userLoginManager_1 = require("../testUtils/userLoginManager");
var userDataHandler_1 = require("../dataHandlers/userDataHandler");
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var expressServer_1 = require("../expressServer");
var chai = require('chai');
var chai_1 = require('chai');
var supertest = require('supertest');
var chaiAsPromised = require('chai-as-promised');
var statusCode_1 = require('../enums/statusCode');
var testConfigurations_1 = require('../../../testConfigurations');
chai.use(chaiAsPromised);
describe('RegisterStrategy', function () {
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
    describe('register', function () {
        it('invalid parameters should fail', function (done) {
            userDefinition.email = 'wrong email';
            server.post('/register')
                .send(userDefinition)
                .expect(statusCode_1.StatusCode.BAD_REQUEST)
                .expect({ error: 'Email is not valid' })
                .end(done);
        });
        it('should redirect to home page', function (done) {
            server.post('/register')
                .send(userDefinition)
                .expect(statusCode_1.StatusCode.OK)
                .expect('redirect-path', '/')
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
        it('existing email should fail', function (done) {
            var otherUserDefinition = {
                username: 'some other username',
                password: 'some other password',
                email: userDefinition.email,
                firstName: 'some other first name',
                lastName: 'some other last name'
            };
            server.post('/register')
                .send(userDefinition)
                .end(function () {
                server.post('/register')
                    .send(otherUserDefinition)
                    .expect(statusCode_1.StatusCode.BAD_REQUEST)
                    .expect({ error: 'The email is taken' })
                    .end(done);
            });
        });
        it('existing username should fail', function (done) {
            var otherUserDefinition = {
                username: userDefinition.username,
                password: 'some other password',
                email: 'someOther@email.com',
                firstName: 'some other first name',
                lastName: 'some other last name'
            };
            server.post('/register')
                .send(userDefinition)
                .end(function () {
                server.post('/register')
                    .send(otherUserDefinition)
                    .expect(statusCode_1.StatusCode.BAD_REQUEST)
                    .expect({ error: 'The username is taken' })
                    .end(done);
            });
        });
        it('no email should create a user', function (done) {
            delete userDefinition.email;
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
    });
});
//# sourceMappingURL=registerStrategy.test.js.map