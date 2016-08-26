"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var addRemoveUserFromTeamOperationBase_1 = require("../base/addRemoveUserFromTeamOperationBase");
var updateUserTeamAdminRightsOperation_1 = require("../userOperations/updateUserTeamAdminRightsOperation");
var updateTeamNameOperation_1 = require("./updateTeamNameOperation");
var getUserByIdOperation_1 = require("../userOperations/getUserByIdOperation");
var notFoundError_1 = require("../../../common/errors/notFoundError");
var getTeamByIdOperation_1 = require("./getTeamByIdOperation");
var operationBase_1 = require("../base/operationBase");
var bluebirdPromise = require('bluebird');
var GetTeamModificationPermissionsOperation = (function (_super) {
    __extends(GetTeamModificationPermissionsOperation, _super);
    function GetTeamModificationPermissionsOperation(teamId, executingUserId) {
        _super.call(this);
        this.teamId = teamId;
        this.executingUserId = executingUserId;
    }
    GetTeamModificationPermissionsOperation.prototype.doWork = function () {
        var _this = this;
        return this._verifyTeamExists()
            .then(function () { return _this._verifyUserExists(); })
            .then(function () { return _this._getTeamModificationPermissions(); });
    };
    GetTeamModificationPermissionsOperation.prototype._verifyTeamExists = function () {
        var _this = this;
        var operation = new getTeamByIdOperation_1.GetTeamByIdOperation(this.teamId);
        return operation.execute()
            .then(function (_team) {
            if (_team) {
                return bluebirdPromise.resolve();
            }
            else {
                var error = new notFoundError_1.NotFoundError("The team with id " + _this.teamId + " was not found");
                return bluebirdPromise.reject(error);
            }
        });
    };
    GetTeamModificationPermissionsOperation.prototype._verifyUserExists = function () {
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
    GetTeamModificationPermissionsOperation.prototype._getTeamModificationPermissions = function () {
        return bluebirdPromise.all([
            this._canUserModifyTeamName(),
            this._canUserModifyTeamAdmins(),
            this._canUserModifyTeamUsers(),
        ]).then(function (_permissions) {
            return {
                canModifyTeamName: _permissions[0],
                canModifyTeamAdmins: _permissions[1],
                canModifyTeamUsers: _permissions[2]
            };
        });
    };
    GetTeamModificationPermissionsOperation.prototype._canUserModifyTeamName = function () {
        var updateTeamNameOperation = new updateTeamNameOperation_1.UpdateTeamNameOperation(this.teamId, '', this.executingUserId);
        return updateTeamNameOperation.canExecute()
            .then(function () {
            return bluebirdPromise.resolve(true);
        }, function () {
            return bluebirdPromise.resolve(false);
        });
    };
    GetTeamModificationPermissionsOperation.prototype._canUserModifyTeamAdmins = function () {
        return updateUserTeamAdminRightsOperation_1.UpdateUserTeamAdminRightsOperation.canUpdateUserRights(this.teamId, this.executingUserId)
            .then(function () {
            return bluebirdPromise.resolve(true);
        }, function () {
            return bluebirdPromise.resolve(false);
        });
    };
    GetTeamModificationPermissionsOperation.prototype._canUserModifyTeamUsers = function () {
        var addRemoveUserFromTeamOperationBase = new addRemoveUserFromTeamOperationBase_1.AddRemoveUserFromTeamOperationBase(this.teamId, this.executingUserId);
        return addRemoveUserFromTeamOperationBase.canExecute()
            .then(function () {
            return bluebirdPromise.resolve(true);
        }, function () {
            return bluebirdPromise.resolve(false);
        });
    };
    return GetTeamModificationPermissionsOperation;
}(operationBase_1.OperationBase));
exports.GetTeamModificationPermissionsOperation = GetTeamModificationPermissionsOperation;
//# sourceMappingURL=getTeamModificationPermissionsOperation.js.map