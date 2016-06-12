"use strict";
var createUserOperation_1 = require("./createUserOperation");
var loginUserOperation_1 = require("./loginUserOperation");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
describe('LoginUserOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var username;
        var password;
        beforeEach(function () {
            var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            username = userInfo.username;
            password = 'some random password';
            var createUserOperation = new createUserOperation_1.CreateUserOperation(username, password, userInfo.email, userInfo.firstName, userInfo.lastName);
            return createUserOperation.execute();
        });
        it('not existing username should reject', function () {
            var operation = new loginUserOperation_1.LoginUserOperation('not existing username', password);
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.rejected;
        });
        it('invalid password should reject', function () {
            var operation = new loginUserOperation_1.LoginUserOperation(username, 'invalid password');
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.rejected;
        });
        it('valid credentials should succeed', function () {
            var operation = new loginUserOperation_1.LoginUserOperation(username, password);
            var resultPromise = operation.execute();
            return chai_1.expect(resultPromise).to.eventually.fulfilled;
        });
    });
});
