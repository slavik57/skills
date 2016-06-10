"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var operationBase_1 = require("./operationBase");
var globalPermission_1 = require("../../models/enums/globalPermission");
var _ = require('lodash');
var ModifyUserPermissionsOperationBase = (function (_super) {
    __extends(ModifyUserPermissionsOperationBase, _super);
    function ModifyUserPermissionsOperationBase(_userIdToAddPermissionsTo, _permissionsToModify, _executingUserId) {
        _super.call(this);
        this._userIdToAddPermissionsTo = _userIdToAddPermissionsTo;
        this._permissionsToModify = _permissionsToModify;
        this._executingUserId = _executingUserId;
    }
    ModifyUserPermissionsOperationBase.getListOfGlobalPermissionsTheExecutingUserCanModify = function (executingUserId) {
        var _this = this;
        this._getAllowedPermissionModificationMap();
        var userGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.getUserGlobalPermissions(executingUserId);
        return userGlobalPermissionsPromise.then(function (_permissions) {
            return _this._getListOfGlobalPermissionsTheExecutingUserCanModify(_permissions);
        });
    };
    ModifyUserPermissionsOperationBase.prototype.canExecute = function () {
        var _this = this;
        var listOfPermissionsTheExecutingUserCanModifyPromise = ModifyUserPermissionsOperationBase.getListOfGlobalPermissionsTheExecutingUserCanModify(this._executingUserId);
        return listOfPermissionsTheExecutingUserCanModifyPromise
            .then(function (_permissionsExecutingUserCanModify) {
            return _this._canExecutingUserModifyPermissions(_permissionsExecutingUserCanModify);
        });
    };
    ModifyUserPermissionsOperationBase._getAllowedPermissionModificationMap = function () {
        if (this._allowedPermissionModificationMap) {
            return this._allowedPermissionModificationMap;
        }
        this._allowedPermissionModificationMap = {};
        this._allowedPermissionModificationMap[globalPermission_1.GlobalPermission.ADMIN] = [
            globalPermission_1.GlobalPermission.ADMIN,
            globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
        ];
        this._allowedPermissionModificationMap[globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN] = [
            globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN
        ];
        this._allowedPermissionModificationMap[globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN] = [
            globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN
        ];
        return this._allowedPermissionModificationMap;
    };
    ModifyUserPermissionsOperationBase._getListOfGlobalPermissionsTheExecutingUserCanModify = function (executingUserPermissions) {
        var result = [];
        var allowedPermissionModificationMap = this._getAllowedPermissionModificationMap();
        executingUserPermissions.forEach(function (_permission) {
            if (_permission in allowedPermissionModificationMap) {
                var allowedPermissionsToModify = allowedPermissionModificationMap[_permission];
                result = _.union(result, allowedPermissionsToModify);
            }
        });
        return result;
    };
    ModifyUserPermissionsOperationBase.prototype._canExecutingUserModifyPermissions = function (permissionsExecutingUserCanModify) {
        var permissionsTheExecutingUserCannotAdd = _.difference(this._permissionsToModify, permissionsExecutingUserCanModify);
        if (permissionsTheExecutingUserCannotAdd.length < 1) {
            return Promise.resolve();
        }
        else {
            return this._rejectWithNotAllowedPermissionsToModify(permissionsTheExecutingUserCannotAdd);
        }
    };
    ModifyUserPermissionsOperationBase.prototype._rejectWithNotAllowedPermissionsToModify = function (permissionsTheExecutingUserCannotAdd) {
        var permissionNames = _.map(permissionsTheExecutingUserCannotAdd, function (_permission) { return globalPermission_1.GlobalPermission[_permission]; });
        var message = 'The executing user cannot modify the permissions: ' + permissionNames.join(', ');
        return Promise.reject(message);
    };
    return ModifyUserPermissionsOperationBase;
}(operationBase_1.OperationBase));
exports.ModifyUserPermissionsOperationBase = ModifyUserPermissionsOperationBase;
