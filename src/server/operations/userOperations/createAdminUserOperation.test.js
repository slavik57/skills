"use strict";
var globalPermission_1 = require("../../models/enums/globalPermission");
var createAdminUserOperation_1 = require("./createAdminUserOperation");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var passwordHash = require('password-hash');
chai.use(chaiAsPromised);
describe('CreateAdminUserOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var operation;
        var expectedUsername;
        var expectedPassword;
        var expectedEmail;
        var expectedFirstName;
        var expectedLastName;
        beforeEach(function () {
            expectedUsername = 'admin';
            expectedPassword = 'admin';
            expectedEmail = null;
            expectedFirstName = 'admin';
            expectedLastName = 'admin';
            operation = new createAdminUserOperation_1.CreateAdminUserOperation();
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
                chai_1.expect(user.attributes.username).to.be.equal(expectedUsername);
                chai_1.expect(user.attributes.email).to.be.equal(expectedEmail);
                chai_1.expect(user.attributes.firstName).to.be.equal(expectedFirstName);
                chai_1.expect(user.attributes.lastName).to.be.equal(expectedLastName);
            });
        });
        it('should add ADMIN global permissions to the user', function () {
            var result = operation.execute();
            return chai_1.expect(result).to.eventually.fulfilled
                .then(function () { return userDataHandler_1.UserDataHandler.getUsers(); })
                .then(function (_users) { return _users[0]; })
                .then(function (_user) { return userDataHandler_1.UserDataHandler.getUserGlobalPermissions(_user.id); })
                .then(function (_permissions) {
                chai_1.expect(_permissions).to.be.deep.equal([globalPermission_1.GlobalPermission.ADMIN]);
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
                chai_1.expect(passwordHash.verify(expectedPassword, actualHashedPassword), 'the password should be hashed correctly').to.be.true;
            });
        });
        it('should return the new user', function () {
            var result = operation.execute();
            return chai_1.expect(result).to.eventually.fulfilled
                .then(function (_user) {
                chai_1.expect(_user.attributes.username).to.be.equal(expectedUsername);
                chai_1.expect(_user.attributes.email).to.be.equal(expectedEmail);
                chai_1.expect(_user.attributes.firstName).to.be.equal(expectedFirstName);
                chai_1.expect(_user.attributes.lastName).to.be.equal(expectedLastName);
            });
        });
    });
});
//# sourceMappingURL=createAdminUserOperation.test.js.map