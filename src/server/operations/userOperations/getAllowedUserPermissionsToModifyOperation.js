"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var globalPermission_1 = require("../../models/enums/globalPermission");
var operationBase_1 = require("../base/operationBase");
var _ = require('lodash');
var GetAllowedUserPermissionsToModifyOperation = (function (_super) {
    __extends(GetAllowedUserPermissionsToModifyOperation, _super);
    function GetAllowedUserPermissionsToModifyOperation(_userId) {
        _super.call(this);
        this._userId = _userId;
    }
    GetAllowedUserPermissionsToModifyOperation.prototype.doWork = function () {
        var _this = this;
        var userGlobalPermissionsPromise = userDataHandler_1.UserDataHandler.getUserGlobalPermissions(this._userId);
        return userGlobalPermissionsPromise.then(function (_permissions) {
            return _this._getListOfGlobalPermissionsTheExecutingUserCanModify(_permissions);
        });
    };
    GetAllowedUserPermissionsToModifyOperation._getAllowedPermissionModificationMap = function () {
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
    GetAllowedUserPermissionsToModifyOperation.prototype._getListOfGlobalPermissionsTheExecutingUserCanModify = function (executingUserPermissions) {
        var result = [];
        var allowedPermissionModificationMap = GetAllowedUserPermissionsToModifyOperation._getAllowedPermissionModificationMap();
        executingUserPermissions.forEach(function (_permission) {
            if (_permission in allowedPermissionModificationMap) {
                var allowedPermissionsToModify = allowedPermissionModificationMap[_permission];
                result = _.union(result, allowedPermissionsToModify);
            }
        });
        return result;
    };
    return GetAllowedUserPermissionsToModifyOperation;
}(operationBase_1.OperationBase));
exports.GetAllowedUserPermissionsToModifyOperation = GetAllowedUserPermissionsToModifyOperation;
//# sourceMappingURL=getAllowedUserPermissionsToModifyOperation.js.map