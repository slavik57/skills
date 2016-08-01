"use strict";
var errorUtils_1 = require("../../../common/errors/errorUtils");
var unauthorizedError_1 = require("../../../common/errors/unauthorizedError");
var globalPermission_1 = require("../../models/enums/globalPermission");
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
            userDataHandler_1.UserDataHandler.createUser(otherUserInfo),
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
                var id = user.id + otherUser.id + 9999;
                operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(id, userPassword, 'new password', id);
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
                operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword + 1, 'new password', user.id);
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
                operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword, '', user.id);
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
            var newPassword;
            beforeEach(function () {
                newPassword = 'some new password for the user';
            });
            describe('on same user executing', function () {
                var operation;
                beforeEach(function () {
                    newPassword = 'some new password for the user';
                    operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword, newPassword, user.id);
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
            describe('on other user executing', function () {
                var operation;
                var executingUser;
                beforeEach(function () {
                    newPassword = 'some new password for the user';
                    return userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(33))
                        .then(function (_user) {
                        executingUser = _user;
                    })
                        .then(function () {
                        operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword, newPassword, executingUser.id);
                    });
                });
                it('should fail execution', function () {
                    var result = operation.execute();
                    return chai_1.expect(result).to.eventually.rejected
                        .then(function (error) {
                        chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(error, unauthorizedError_1.UnauthorizedError)).to.be.true;
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
                describe('other user is admin', function () {
                    beforeEach(function () {
                        return userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, [globalPermission_1.GlobalPermission.ADMIN]);
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
                    describe('on wrong password', function () {
                        var operation;
                        var newPassword;
                        beforeEach(function () {
                            newPassword = 'new password';
                            operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, 'wrong password', newPassword, executingUser.id);
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
                    describe('on empty new password', function () {
                        var operation;
                        beforeEach(function () {
                            operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword, '', executingUser.id);
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
                });
            });
        });
    });
    describe('canChangePassword', function () {
        describe('executing user is same as the password change user', function () {
            it('null new password, verifyNewPassword = true, should reject', function () {
                var operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword, null, user.id);
                return chai_1.expect(operation.canChangePassword(true)).to.be.rejected;
            });
            it('not null new password, verifyNewPassword = true, should resolve', function () {
                var operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword, 'new password', user.id);
                return chai_1.expect(operation.canChangePassword(true)).to.be.fulfilled;
            });
            it('null new password, verifyNewPassword = false, should resolve', function () {
                var operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword, null, user.id);
                return chai_1.expect(operation.canChangePassword(false)).to.be.fulfilled;
            });
            it('not null new password, verifyNewPassword = false, should resolve', function () {
                var operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword, 'new password', user.id);
                return chai_1.expect(operation.canChangePassword(false)).to.be.fulfilled;
            });
        });
        describe('executing user is not the same as the password change user', function () {
            it('null new password, verifyNewPassword = true, should reject', function () {
                var operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword, null, otherUser.id);
                return chai_1.expect(operation.canChangePassword(true)).to.be.rejected;
            });
            it('not null new password, verifyNewPassword = true, should reject', function () {
                var operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword, 'new password', otherUser.id);
                return chai_1.expect(operation.canChangePassword(true)).to.be.rejected;
            });
            it('null new password, verifyNewPassword = false, should reject', function () {
                var operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword, null, otherUser.id);
                return chai_1.expect(operation.canChangePassword(false)).to.be.rejected;
            });
            it('not null new password, verifyNewPassword = false, should reject', function () {
                var operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword, 'new password', otherUser.id);
                return chai_1.expect(operation.canChangePassword(false)).to.be.rejected;
            });
        });
        describe('executing user is not the same as the password change user but admin', function () {
            beforeEach(function () {
                return userDataHandler_1.UserDataHandler.addGlobalPermissions(otherUser.id, [globalPermission_1.GlobalPermission.ADMIN]);
            });
            it('null new password, verifyNewPassword = true, should reject', function () {
                var operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword, null, otherUser.id);
                return chai_1.expect(operation.canChangePassword(true)).to.be.rejected;
            });
            it('not null new password, verifyNewPassword = true, should resolve', function () {
                var operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword, 'new password', otherUser.id);
                return chai_1.expect(operation.canChangePassword(true)).to.be.fulfilled;
            });
            it('null new password, verifyNewPassword = false, should resolve', function () {
                var operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword, null, otherUser.id);
                return chai_1.expect(operation.canChangePassword(false)).to.be.fulfilled;
            });
            it('not null new password, verifyNewPassword = false, should resolve', function () {
                var operation = new updateUserPasswordOperation_1.UpdateUserPasswordOperation(user.id, userPassword, 'new password', otherUser.id);
                return chai_1.expect(operation.canChangePassword(false)).to.be.fulfilled;
            });
        });
    });
});
//# sourceMappingURL=updateUserPasswordOperation.test.js.map