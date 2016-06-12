"use strict";
var globalPermission_1 = require("../../models/enums/globalPermission");
var createUserOperation_1 = require("./createUserOperation");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var passwordHash = require('password-hash');
chai.use(chaiAsPromised);
describe('CreateUserOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        describe('on invalid user info', function () {
            var operation;
            beforeEach(function () {
                var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
                delete userInfo.username;
                operation = new createUserOperation_1.CreateUserOperation(userInfo.username, userInfo.password_hash, userInfo.email, userInfo.firstName, userInfo.lastName);
            });
            it('should fail execution', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected;
            });
            it('should not create a user', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function () { return userDataHandler_1.UserDataHandler.getUsers(); })
                    .then(function (_users) {
                    chai_1.expect(_users).to.be.length(0);
                });
            });
        });
        describe('on valid user info', function () {
            var operation;
            var userInfo;
            var password;
            beforeEach(function () {
                userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
                password = 'some random passowrd';
                operation = new createUserOperation_1.CreateUserOperation(userInfo.username, password, userInfo.email, userInfo.firstName, userInfo.lastName);
            });
            it('should succeed execution', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled;
            });
            it('should create a correct user', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return userDataHandler_1.UserDataHandler.getUsers(); })
                    .then(function (_users) {
                    chai_1.expect(_users).to.be.length(1);
                    var user = _users[0];
                    chai_1.expect(user.attributes.username).to.be.equal(userInfo.username);
                    chai_1.expect(user.attributes.email).to.be.equal(userInfo.email);
                    chai_1.expect(user.attributes.firstName).to.be.equal(userInfo.firstName);
                    chai_1.expect(user.attributes.lastName).to.be.equal(userInfo.lastName);
                });
            });
            it('should add READER global permissions to the user', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return userDataHandler_1.UserDataHandler.getUsers(); })
                    .then(function (_users) { return _users[0]; })
                    .then(function (_user) { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(_user.id); })
                    .then(function (_permissions) {
                    chai_1.expect(_permissions).to.be.deep.equal([globalPermission_1.GlobalPermission.READER]);
                });
            });
            it('should hash the password correctly', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return userDataHandler_1.UserDataHandler.getUsers(); })
                    .then(function (_users) {
                    chai_1.expect(_users).to.be.length(1);
                    var user = _users[0];
                    var actualHashedPassword = user.attributes.password_hash;
                    chai_1.expect(passwordHash.isHashed(actualHashedPassword), 'should hash the password').to.be.true;
                    chai_1.expect(passwordHash.verify(password, actualHashedPassword), 'the password should be hashed correctly').to.be.true;
                });
            });
        });
    });
});
