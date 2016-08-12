"use strict";
var getUsersByPartialUsernameOperation_1 = require("./getUsersByPartialUsernameOperation");
var modelVerificator_1 = require("../../testUtils/modelVerificator");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
describe('GetUsersByPartialUsernameOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var users;
        var usernameSuffix;
        beforeEach(function () {
            usernameSuffix = '_GetUsersByPartialUsernameOperation';
            var createUserPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(4, usernameSuffix)
                .then(function (_users) {
                users = _users;
            });
            return createUserPromise;
        });
        it('getting by "2" should return correct user', function () {
            var operation = new getUsersByPartialUsernameOperation_1.GetUsersByPartialUsernameOperation('2');
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualUsers) {
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(_actualUsers, [users[2]]);
            });
        });
        it('getting by "3" should return correct user', function () {
            var operation = new getUsersByPartialUsernameOperation_1.GetUsersByPartialUsernameOperation('3');
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualUsers) {
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(_actualUsers, [users[3]]);
            });
        });
        it('getting by usernameSuffix should return correct users', function () {
            var operation = new getUsersByPartialUsernameOperation_1.GetUsersByPartialUsernameOperation(usernameSuffix);
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualUsers) {
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(_actualUsers, users);
            });
        });
        it('getting by usernameSuffix with null max users should return correct users', function () {
            var operation = new getUsersByPartialUsernameOperation_1.GetUsersByPartialUsernameOperation(usernameSuffix, null);
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualUsers) {
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(_actualUsers, users);
            });
        });
        it('getting by usernameSuffix with undefined max users should return correct users', function () {
            var operation = new getUsersByPartialUsernameOperation_1.GetUsersByPartialUsernameOperation(usernameSuffix, undefined);
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualUsers) {
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(_actualUsers, users);
            });
        });
        it('getting by usernameSuffix with limited number of users to 0 should return no users', function () {
            var operation = new getUsersByPartialUsernameOperation_1.GetUsersByPartialUsernameOperation(usernameSuffix, 0);
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualUsers) {
                chai_1.expect(_actualUsers).to.be.length(0);
            });
        });
        it('getting by usernameSuffix with limited number of users should return correct users', function () {
            var maxNumberOfUsers = 1;
            var operation = new getUsersByPartialUsernameOperation_1.GetUsersByPartialUsernameOperation(usernameSuffix, maxNumberOfUsers);
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualUsers) {
                chai_1.expect(_actualUsers).to.be.length(maxNumberOfUsers);
                _actualUsers.forEach(function (_user) {
                    chai_1.expect(_user.attributes.username).to.contain(usernameSuffix);
                });
            });
        });
    });
});
//# sourceMappingURL=getUsersByPartialUsernameOperation.test.js.map