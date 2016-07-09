"use strict";
var updateUserDetailsOperation_1 = require("./updateUserDetailsOperation");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var modelInfoVerificator_1 = require("../../testUtils/modelInfoVerificator");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
describe('UpdateUserDetailsOperation', function () {
    var user;
    var otherUser;
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables()
            .then(function () { return environmentDirtifier_1.EnvironmentDirtifier.createUsers(2); })
            .then(function (_users) {
            user = _users[0], otherUser = _users[1];
        });
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
                operation = new updateUserDetailsOperation_1.UpdateUserDetailsOperation(user.id, userInfo.username, userInfo.email, userInfo.firstName, userInfo.lastName);
            });
            it('should fail execution', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected;
            });
            it('should not update the user', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function () { return userDataHandler_1.UserDataHandler.getUser(user.id); })
                    .then(function (_user) {
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_user.attributes, user.attributes);
                });
            });
        });
        describe('on valid user info', function () {
            var operation;
            var newUserInfo;
            beforeEach(function () {
                newUserInfo = {
                    username: user.attributes.username + ' new username',
                    password_hash: user.attributes.password_hash,
                    email: 'newMail' + user.attributes.email,
                    firstName: user.attributes.firstName + ' new first name',
                    lastName: user.attributes.lastName + ' new last name'
                };
                operation = new updateUserDetailsOperation_1.UpdateUserDetailsOperation(user.id, newUserInfo.username, newUserInfo.email, newUserInfo.firstName, newUserInfo.lastName);
            });
            it('should succeed execution', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled;
            });
            it('should update the user details', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return userDataHandler_1.UserDataHandler.getUser(user.id); })
                    .then(function (_user) {
                    chai_1.expect(_user.attributes.username).to.be.equal(newUserInfo.username);
                    chai_1.expect(_user.attributes.email).to.be.equal(newUserInfo.email);
                    chai_1.expect(_user.attributes.firstName).to.be.equal(newUserInfo.firstName);
                    chai_1.expect(_user.attributes.lastName).to.be.equal(newUserInfo.lastName);
                });
            });
            it('without an email should update the user details', function () {
                operation = new updateUserDetailsOperation_1.UpdateUserDetailsOperation(user.id, newUserInfo.username, null, newUserInfo.firstName, newUserInfo.lastName);
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return userDataHandler_1.UserDataHandler.getUser(user.id); })
                    .then(function (_user) {
                    chai_1.expect(_user.attributes.username).to.be.equal(newUserInfo.username);
                    chai_1.expect(_user.attributes.email).to.be.null;
                    chai_1.expect(_user.attributes.firstName).to.be.equal(newUserInfo.firstName);
                    chai_1.expect(_user.attributes.lastName).to.be.equal(newUserInfo.lastName);
                });
            });
            it('should not change the password', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return userDataHandler_1.UserDataHandler.getUser(user.id); })
                    .then(function (_user) {
                    chai_1.expect(_user.attributes.password_hash).to.be.equal(user.attributes.password_hash);
                });
            });
            it('should return the user', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function (_user) {
                    chai_1.expect(_user.attributes.username).to.be.equal(newUserInfo.username);
                    chai_1.expect(_user.attributes.email).to.be.equal(newUserInfo.email);
                    chai_1.expect(_user.attributes.firstName).to.be.equal(newUserInfo.firstName);
                    chai_1.expect(_user.attributes.lastName).to.be.equal(newUserInfo.lastName);
                });
            });
            it('with same username should succeed', function () {
                var updateUserDetailsOperation = new updateUserDetailsOperation_1.UpdateUserDetailsOperation(user.id, user.attributes.username, newUserInfo.email, newUserInfo.firstName, newUserInfo.lastName);
                var result = updateUserDetailsOperation.execute()
                    .then(function () { return operation.execute(); });
                return chai_1.expect(result).to.eventually.fulfilled;
            });
            it('with same email should succeed', function () {
                var updateUserDetailsOperation = new updateUserDetailsOperation_1.UpdateUserDetailsOperation(user.id, newUserInfo.username, user.attributes.email, newUserInfo.firstName, newUserInfo.lastName);
                var result = updateUserDetailsOperation.execute()
                    .then(function () { return operation.execute(); });
                return chai_1.expect(result).to.eventually.fulfilled;
            });
            it('with same firstName should succeed', function () {
                var updateUserDetailsOperation = new updateUserDetailsOperation_1.UpdateUserDetailsOperation(user.id, newUserInfo.username, newUserInfo.email, user.attributes.firstName, newUserInfo.lastName);
                var result = updateUserDetailsOperation.execute()
                    .then(function () { return operation.execute(); });
                return chai_1.expect(result).to.eventually.fulfilled;
            });
            it('with same lastName should succeed', function () {
                var updateUserDetailsOperation = new updateUserDetailsOperation_1.UpdateUserDetailsOperation(user.id, newUserInfo.username, newUserInfo.email, newUserInfo.firstName, user.attributes.lastName);
                var result = updateUserDetailsOperation.execute()
                    .then(function () { return operation.execute(); });
                return chai_1.expect(result).to.eventually.fulfilled;
            });
            it('with existing username should fail', function () {
                var updateUserDetailsOperation = new updateUserDetailsOperation_1.UpdateUserDetailsOperation(user.id, otherUser.attributes.username, newUserInfo.email, newUserInfo.firstName, newUserInfo.lastName);
                var result = updateUserDetailsOperation.execute()
                    .then(function () { return operation.execute(); });
                return chai_1.expect(result).to.eventually.rejected
                    .then(function (error) {
                    chai_1.expect(error).to.be.equal('The username is taken');
                });
            });
            it('with existing email should fail', function () {
                var updateUserDetailsOperation = new updateUserDetailsOperation_1.UpdateUserDetailsOperation(user.id, newUserInfo.username, otherUser.attributes.email, newUserInfo.firstName, newUserInfo.lastName);
                var result = updateUserDetailsOperation.execute()
                    .then(function () { return operation.execute(); });
                return chai_1.expect(result).to.eventually.rejected
                    .then(function (error) {
                    chai_1.expect(error).to.be.equal('The email is taken');
                });
            });
            it('with existing firstName should succeed', function () {
                var updateUserDetailsOperation = new updateUserDetailsOperation_1.UpdateUserDetailsOperation(user.id, newUserInfo.username, newUserInfo.email, otherUser.attributes.firstName, newUserInfo.lastName);
                var result = updateUserDetailsOperation.execute()
                    .then(function () { return operation.execute(); });
                return chai_1.expect(result).to.eventually.fulfilled;
            });
            it('with existing lastName should succeed', function () {
                var updateUserDetailsOperation = new updateUserDetailsOperation_1.UpdateUserDetailsOperation(user.id, newUserInfo.username, newUserInfo.email, newUserInfo.firstName, otherUser.attributes.lastName);
                var result = updateUserDetailsOperation.execute()
                    .then(function () { return operation.execute(); });
                return chai_1.expect(result).to.eventually.fulfilled;
            });
        });
        describe('without email', function () {
            var operation;
            var newUserInfo;
            beforeEach(function () {
                newUserInfo = {
                    username: user.attributes.username + ' new username',
                    password_hash: user.attributes.password_hash,
                    email: 'newMail' + user.attributes.email,
                    firstName: user.attributes.firstName + ' new first name',
                    lastName: user.attributes.lastName + ' new last name'
                };
                delete newUserInfo.email;
                operation = new updateUserDetailsOperation_1.UpdateUserDetailsOperation(user.id, newUserInfo.username, newUserInfo.email, newUserInfo.firstName, newUserInfo.lastName);
            });
            it('should update the user details correctly', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return userDataHandler_1.UserDataHandler.getUser(user.id); })
                    .then(function (_user) {
                    chai_1.expect(_user.attributes.username).to.be.equal(newUserInfo.username);
                    chai_1.expect(_user.attributes.email).to.be.null;
                    chai_1.expect(_user.attributes.firstName).to.be.equal(newUserInfo.firstName);
                    chai_1.expect(_user.attributes.lastName).to.be.equal(newUserInfo.lastName);
                });
            });
        });
        describe('with empty email', function () {
            var operation;
            var newUserInfo;
            beforeEach(function () {
                newUserInfo = {
                    username: user.attributes.username + ' new username',
                    password_hash: user.attributes.password_hash,
                    email: 'newMail' + user.attributes.email,
                    firstName: user.attributes.firstName + ' new first name',
                    lastName: user.attributes.lastName + ' new last name'
                };
                newUserInfo.email = '';
                operation = new updateUserDetailsOperation_1.UpdateUserDetailsOperation(user.id, newUserInfo.username, newUserInfo.email, newUserInfo.firstName, newUserInfo.lastName);
            });
            it('should update the user details correctly', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return userDataHandler_1.UserDataHandler.getUser(user.id); })
                    .then(function (_user) {
                    chai_1.expect(_user.attributes.username).to.be.equal(newUserInfo.username);
                    chai_1.expect(_user.attributes.email).to.be.null;
                    chai_1.expect(_user.attributes.firstName).to.be.equal(newUserInfo.firstName);
                    chai_1.expect(_user.attributes.lastName).to.be.equal(newUserInfo.lastName);
                });
            });
        });
    });
});
//# sourceMappingURL=updateUserDetailsOperation.test.js.map