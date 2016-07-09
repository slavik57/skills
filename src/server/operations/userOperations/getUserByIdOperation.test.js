"use strict";
var modelInfoVerificator_1 = require("../../testUtils/modelInfoVerificator");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var getUserByIdOperation_1 = require('./getUserByIdOperation');
chai.use(chaiAsPromised);
describe('GetUserByIdOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        describe('existing user', function () {
            var user;
            var operation;
            beforeEach(function () {
                var createUserPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                    .then(function (_users) {
                    user = _users[0];
                });
                return createUserPromise.then(function () {
                    operation = new getUserByIdOperation_1.GetUserByIdOperation(user.id);
                });
            });
            it('should return correct user', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function (_actualUser) {
                    modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_actualUser.attributes, user.attributes);
                });
            });
        });
        describe('not existing user', function () {
            var operation;
            beforeEach(function () {
                operation = new getUserByIdOperation_1.GetUserByIdOperation(11122233);
            });
            it('should return null', function () {
                var resultPromise = operation.execute();
                return chai_1.expect(resultPromise).to.eventually.fulfilled
                    .then(function (_actualUser) {
                    chai_1.expect(_actualUser).to.be.null;
                });
            });
        });
    });
});
//# sourceMappingURL=getUserByIdOperation.test.js.map