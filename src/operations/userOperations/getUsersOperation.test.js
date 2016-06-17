"use strict";
var modelVerificator_1 = require("../../testUtils/modelVerificator");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var getUsersOperation_1 = require('./getUsersOperation');
chai.use(chaiAsPromised);
describe('GetUsersOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var users;
        var operation;
        beforeEach(function () {
            var createUserPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(4)
                .then(function (_users) {
                users = _users;
            });
            return createUserPromise.then(function () {
                operation = new getUsersOperation_1.GetUsersOperation();
            });
        });
        it('should return correct users', function () {
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualUsers) {
                modelVerificator_1.ModelVerificator.verifyMultipleModelsEqualById(_actualUsers, users);
            });
        });
    });
});
//# sourceMappingURL=getUsersOperation.test.js.map