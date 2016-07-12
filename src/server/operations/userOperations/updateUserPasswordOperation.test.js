"use strict";
var updateUserPasswordOperation_1 = require("./updateUserPasswordOperation");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var modelInfoVerificator_1 = require("../../testUtils/modelInfoVerificator");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var passwordHash = require('password-hash');
chai.use(chaiAsPromised);
describe('UpdateUserPasswordOperation', function () {
    var userInfo;
    var otherUserInfo;
    var user;
    var otherUser;
    var userPassword;
    var otherUserPassword;
    beforeEach(function () {
        userPassword = 'some password';
        otherUserPassword = 'some other password';
        return environmentCleaner_1.EnvironmentCleaner.clearTables()
            .then(function () {
            userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            otherUserInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2);
            userInfo.password_hash = passwordHash.generate(userPassword);
            otherUserInfo.password_hash = passwordHash.generate(otherUserPassword);
        })
            .then(function () { return Promise.all([
            userDataHandler_1.UserDataHandler.createUser(userInfo),
            userDataHandler_1.UserDataHandler.createUser(otherUserInfo)
        ]); })
            .then(function (_users) {
            user = _users[0], otherUser = _users[1];
        });
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        describe('on not existing user id', function () {
            var operation;
            beforeEach(function () {
                operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id + otherUser.id + 9999, userPassword, 'new password');
            });
            it('should fail execution', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function (error) {
                    chai_1.expect(error).to.be.equal('Something went wrong');
                });
            });
        });
        describe('on wrong password', function () {
            var operation;
            beforeEach(function () {
                operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword + 1, 'new password');
            });
            it('should fail execution', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function (error) {
                    chai_1.expect(error).to.be.equal('Wrong password');
                });
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
        describe('on empty new password', function () {
            var operation;
            beforeEach(function () {
                operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword, '');
            });
            it('should fail execution', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.rejected
                    .then(function (error) {
                    chai_1.expect(error).to.be.equal('The new password cannot be empty');
                });
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
            var newPassword;
            beforeEach(function () {
                newPassword = 'some new password for the user';
                operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword, newPassword);
            });
            it('should succeed execution', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled;
            });
            it('should update the user password', function () {
                var result = operation.execute();
                return chai_1.expect(result).to.eventually.fulfilled
                    .then(function () { return userDataHandler_1.UserDataHandler.getUser(user.id); })
                    .then(function (_user) {
                    chai_1.expect(passwordHash.verify(newPassword, _user.attributes.password_hash)).to.be.true;
                });
            });
        });
    });
});
//# sourceMappingURL=updateUserPasswordOperation.test.js.map