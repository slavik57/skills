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
        beforeEach(function () {
            var createUserPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(4)
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
        it('getting by "username" should return correct user', function () {
            var operation = new getUsersByPartialUsernameOperation_1.GetUsersByPartialUsernameOperation('username');
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualUsers) {
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(_actualUsers, users);
            });
        });
    });
});
//# sourceMappingURL=getUsersByPartialUsernameOperation.test.js.map