"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var userDataHandler_1 = require("../dataHandlers/userDataHandler");
var operationBase_1 = require("./base/operationBase");
var globalPermission_1 = require("../models/enums/globalPermission");
var _ = require('lodash');
var AddUserPermissionOperation = (function (_super) {
    __extends(AddUserPermissionOperation, _super);
    function AddUserPermissionOperation(_userIdToAddPermissionsTo, _permissionsToAdd, _executingUserId) {
        _super.call(this);
        this._userIdToAddPermissionsTo = _userIdToAddPermissionsTo;
        this._permissionsToAdd = _permissionsToAdd;
        this._executingUserId = _executingUserId;
    }
    AddUserPermissionOperation.getListOfGlobalPermissionsTheExecutingUserCanAddToUser = function (executingUserId) {
        var _this = this;
        this._getAllowedPermissionAssignmentMap();
        var userGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.getUserGlobalPermissions(executingUserId);
        return userGlobalPermissionsPromise.then(function (_permissions) {
            return _this._getListOfGlobalPermissionsTheExecutingUserCanAddToUser(_permissions);
        });
    };
    AddUserPermissionOperation.prototype.canExecute = function () {
        var _this = this;
        var listOfPermissionsTheExecutingUserCanAddPromise = AddUserPermissionOperation.getListOfGlobalPermissionsTheExecutingUserCanAddToUser(this._executingUserId);
        return listOfPermissionsTheExecutingUserCanAddPromise
            .then(function (_permissionsExecutingUserCanAdd) {
            return _this._canExecutingUserAddPermissions(_permissionsExecutingUserCanAdd);
        });
    };
    AddUserPermissionOperation.prototype.doWork = function () {
        return userDataHandler_1.UserDataHandler.addGlobalPermissions(this._userIdToAddPermissionsTo, this._permissionsToAdd);
    };
    AddUserPermissionOperation._getAllowedPermissionAssignmentMap = function () {
        if (this._allowedPermissionAssignmentMap) {
            return this._allowedPermissionAssignmentMap;
        }
        this._allowedPermissionAssignmentMap = {};
        this._allowedPermissionAssignmentMap[globalPermission_1.GlobalPermission.ADMIN] = [
            globalPermission_1.GlobalPermission.ADMIN,
            globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
        ];
        this._allowedPermissionAssignmentMap[globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN] = [
            globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
        ];
        this._allowedPermissionAssignmentMap[globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN] = [
            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
        ];
        return this._allowedPermissionAssignmentMap;
    };
    AddUserPermissionOperation._getListOfGlobalPermissionsTheExecutingUserCanAddToUser = function (executingUserPermissions) {
        var result = [];
        var allowedPermissionAssignmentMap = this._getAllowedPermissionAssignmentMap();
        executingUserPermissions.forEach(function (_permission) {
            if (_permission in allowedPermissionAssignmentMap) {
                var allowedPermissionsToAssign = allowedPermissionAssignmentMap[_permission];
                result = _.union(result, allowedPermissionsToAssign);
            }
        });
        return result;
    };
    AddUserPermissionOperation.prototype._canExecutingUserAddPermissions = function (permissionsExecutingUserCanAdd) {
        var permissionsTheExecutingUserCannotAdd = _.difference(this._permissionsToAdd, permissionsExecutingUserCanAdd);
        if (permissionsTheExecutingUserCannotAdd.length < 1) {
            return Promise.resolve();
        }
        else {
            return this._rejectWithNotAllowedPermissionsToAdd(permissionsTheExecutingUserCannotAdd);
        }
    };
    AddUserPermissionOperation.prototype._rejectWithNotAllowedPermissionsToAdd = function (permissionsTheExecutingUserCannotAdd) {
        var permissionNames = _.map(permissionsTheExecutingUserCannotAdd, function (_permission) { return globalPermission_1.GlobalPermission[_permission]; });
        var message = 'The executing user cannot add the next permissions: ' + permissionNames.join(', ');
        return Promise.reject(message);
    };
    return AddUserPermissionOperation;
}(operationBase_1.OperationBase));
exports.AddUserPermissionOperation = AddUserPermissionOperation;
