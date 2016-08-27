"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var getSkillByIdOperation_1 = require("./getSkillByIdOperation");
var addSkillPrerequisiteOperation_1 = require("./addSkillPrerequisiteOperation");
var getUserByIdOperation_1 = require("../userOperations/getUserByIdOperation");
var notFoundError_1 = require("../../../common/errors/notFoundError");
var operationBase_1 = require("../base/operationBase");
var bluebirdPromise = require('bluebird');
var GetSkillModificationPermissionsOperation = (function (_super) {
    __extends(GetSkillModificationPermissionsOperation, _super);
    function GetSkillModificationPermissionsOperation(skillId, executingUserId) {
        _super.call(this);
        this.skillId = skillId;
        this.executingUserId = executingUserId;
    }
    GetSkillModificationPermissionsOperation.prototype.doWork = function () {
        var _this = this;
        return this._verifySkillExists()
            .then(function () { return _this._verifyUserExists(); })
            .then(function () { return _this._getSkillModificationPermissions(); });
    };
    GetSkillModificationPermissionsOperation.prototype._verifySkillExists = function () {
        var _this = this;
        var operation = new getSkillByIdOperation_1.GetSkillByIdOperation(this.skillId);
        return operation.execute()
            .then(function (_skill) {
            if (_skill) {
                return bluebirdPromise.resolve();
            }
            else {
                var error = new notFoundError_1.NotFoundError("The skill with id " + _this.skillId + " was not found");
                return bluebirdPromise.reject(error);
            }
        });
    };
    GetSkillModificationPermissionsOperation.prototype._verifyUserExists = function () {
        var _this = this;
        var operation = new getUserByIdOperation_1.GetUserByIdOperation(this.executingUserId);
        return operation.execute()
            .then(function (_user) {
            if (_user) {
                return bluebirdPromise.resolve();
            }
            else {
                var error = new notFoundError_1.NotFoundError("The user with id " + _this.executingUserId + " was not found");
                return bluebirdPromise.reject(error);
            }
        });
    };
    GetSkillModificationPermissionsOperation.prototype._getSkillModificationPermissions = function () {
        return bluebirdPromise.all([
            this._canUserAddPrerequisites()
        ]).then(function (_permissions) {
            return {
                canAddPrerequisites: _permissions[0],
                canAddDependencies: _permissions[0]
            };
        });
    };
    GetSkillModificationPermissionsOperation.prototype._canUserAddPrerequisites = function () {
        var operation = new addSkillPrerequisiteOperation_1.AddSkillPrerequisiteOperation(this.skillId, -1, this.executingUserId);
        return operation.canExecute()
            .then(function () {
            return bluebirdPromise.resolve(true);
        }, function () {
            return bluebirdPromise.resolve(false);
        });
    };
    return GetSkillModificationPermissionsOperation;
}(operationBase_1.OperationBase));
exports.GetSkillModificationPermissionsOperation = GetSkillModificationPermissionsOperation;
//# sourceMappingURL=getSkillModificationPermissionsOperation.js.map