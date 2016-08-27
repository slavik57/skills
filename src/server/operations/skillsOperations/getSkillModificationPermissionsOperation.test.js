"use strict";
var globalPermission_1 = require("../../models/enums/globalPermission");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var notFoundError_1 = require("../../../common/errors/notFoundError");
var errorUtils_1 = require("../../../common/errors/errorUtils");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var getSkillModificationPermissionsOperation_1 = require('./getSkillModificationPermissionsOperation');
var enum_values_1 = require('enum-values');
var _ = require('lodash');
chai.use(chaiAsPromised);
describe('GetSkillModificationPermissionsOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var executingUser;
        var skill;
        beforeEach(function () {
            return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) {
                executingUser = _users[0];
            })
                .then(function () { return environmentDirtifier_1.EnvironmentDirtifier.createSkills(1, executingUser.id); })
                .then(function (_skills) {
                skill = _skills[0];
            });
        });
        it('not existing skill should reject correctly', function () {
            var operation = new getSkillModificationPermissionsOperation_1.GetSkillModificationPermissionsOperation(123321, executingUser.id);
            return chai_1.expect(operation.execute()).to.eventually.rejected
                .then(function (_error) {
                chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(_error, notFoundError_1.NotFoundError)).to.be.true;
            });
        });
        it('not existing user should reject correctly', function () {
            var operation = new getSkillModificationPermissionsOperation_1.GetSkillModificationPermissionsOperation(skill.id, 1232123);
            return chai_1.expect(operation.execute()).to.eventually.rejected
                .then(function (_error) {
                chai_1.expect(errorUtils_1.ErrorUtils.isErrorOfType(_error, notFoundError_1.NotFoundError)).to.be.true;
            });
        });
        it('for admin should return correct value', function () {
            var permissions = [
                globalPermission_1.GlobalPermission.ADMIN
            ];
            var addPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            var operation = new getSkillModificationPermissionsOperation_1.GetSkillModificationPermissionsOperation(skill.id, executingUser.id);
            var expectedPermissions = {
                canModifyPrerequisites: true,
                canModifyDependencies: true
            };
            var executePromise = addPermissions.then(function () { return operation.execute(); });
            return chai_1.expect(executePromise).to.eventually.be.deep.equal(expectedPermissions);
        });
        it('for skills list admin should return correct value', function () {
            var permissions = [
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
            ];
            var addPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            var operation = new getSkillModificationPermissionsOperation_1.GetSkillModificationPermissionsOperation(skill.id, executingUser.id);
            var expectedPermissions = {
                canModifyPrerequisites: true,
                canModifyDependencies: true
            };
            var executePromise = addPermissions.then(function () { return operation.execute(); });
            return chai_1.expect(executePromise).to.eventually.be.deep.equal(expectedPermissions);
        });
        it('for user that is not admin nor skills list admin should return correct value', function () {
            var permissions = _.difference(enum_values_1.EnumValues.getValues(globalPermission_1.GlobalPermission), [globalPermission_1.GlobalPermission.ADMIN, globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN]);
            var addPermissions = userDataHandler_1.UserDataHandler.addGlobalPermissions(executingUser.id, permissions);
            var operation = new getSkillModificationPermissionsOperation_1.GetSkillModificationPermissionsOperation(skill.id, executingUser.id);
            var expectedPermissions = {
                canModifyPrerequisites: false,
                canModifyDependencies: false
            };
            var executePromise = addPermissions.then(function () { return operation.execute(); });
            return chai_1.expect(executePromise).to.eventually.be.deep.equal(expectedPermissions);
        });
    });
});
//# sourceMappingURL=getSkillModificationPermissionsOperation.test.js.map