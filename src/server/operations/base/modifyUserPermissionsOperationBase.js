"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var getAllowedUserPermissionsToModifyOperation_1 = require("../userOperations/getAllowedUserPermissionsToModifyOperation");
var operationBase_1 = require("./operationBase");
var globalPermission_1 = require("../../models/enums/globalPermission");
var _ = require('lodash');
var bluebirdPromise = require('bluebird');
var ModifyUserPermissionsOperationBase = (function (_super) {
    __extends(ModifyUserPermissionsOperationBase, _super);
    function ModifyUserPermissionsOperationBase(_userIdToModifyPermissionsOf, _permissionsToModify, _executingUserId) {
        _super.call(this);
        this._userIdToModifyPermissionsOf = _userIdToModifyPermissionsOf;
        this._permissionsToModify = _permissionsToModify;
        this._executingUserId = _executingUserId;
    }
    ModifyUserPermissionsOperationBase.prototype.canExecute = function () {
        var _this = this;
        var getAllowedUserPermissionsToModifyOperation = new getAllowedUserPermissionsToModifyOperation_1.GetAllowedUserPermissionsToModifyOperation(this._executingUserId);
        var listOfPermissionsTheExecutingUserCanModifyPromise = getAllowedUserPermissionsToModifyOperation.execute();
        return listOfPermissionsTheExecutingUserCanModifyPromise
            .then(function (_permissionsExecutingUserCanModify) {
            return _this._canExecutingUserModifyPermissions(_permissionsExecutingUserCanModify);
        });
    };
    ModifyUserPermissionsOperationBase.prototype._canExecutingUserModifyPermissions = function (permissionsExecutingUserCanModify) {
        var permissionsTheExecutingUserCannotAdd = _.difference(this._permissionsToModify, permissionsExecutingUserCanModify);
        if (permissionsTheExecutingUserCannotAdd.length < 1) {
            return bluebirdPromise.resolve();
        }
        else {
            return this._rejectWithNotAllowedPermissionsToModify(permissionsTheExecutingUserCannotAdd);
        }
    };
    ModifyUserPermissionsOperationBase.prototype._rejectWithNotAllowedPermissionsToModify = function (permissionsTheExecutingUserCannotAdd) {
        var permissionNames = _.map(permissionsTheExecutingUserCannotAdd, function (_permission) { return globalPermission_1.GlobalPermission[_permission]; });
        var error = new Error();
        error.message = 'The executing user cannot modify the permissions: ' + permissionNames.join(', ');
        return bluebirdPromise.reject(error);
    };
    return ModifyUserPermissionsOperationBase;
}(operationBase_1.OperationBase));
exports.ModifyUserPermissionsOperationBase = ModifyUserPermissionsOperationBase;
//# sourceMappingURL=modifyUserPermissionsOperationBase.js.map