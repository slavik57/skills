"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var unauthorizedError_1 = require("../../../common/errors/unauthorizedError");
var operationBase_1 = require("./operationBase");
var userDataHandler_1 = require("../../dataHandlers/userDataHandler");
var globalPermission_1 = require("../../models/enums/globalPermission");
var AuthenticatedOperationBase = (function (_super) {
    __extends(AuthenticatedOperationBase, _super);
    function AuthenticatedOperationBase(_executingUserId) {
        _super.call(this);
        this._executingUserId = _executingUserId;
    }
    Object.defineProperty(AuthenticatedOperationBase.prototype, "executingUserId", {
        get: function () {
            return this._executingUserId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthenticatedOperationBase.prototype, "sufficientOperationGlobalPermissions", {
        get: function () {
            return [];
        },
        enumerable: true,
        configurable: true
    });
    AuthenticatedOperationBase.prototype.canExecute = function () {
        var _this = this;
        var userPermissionsPromise = userDataHandler_1.UserDataHandler.getUserGlobalPermissions(this.executingUserId);
        return _super.prototype.canExecute.call(this)
            .then(function () { return userPermissionsPromise; })
            .then(function (_permissions) {
            if (_this._userHasPermissions(_permissions)) {
                return Promise.resolve();
            }
            else {
                return Promise.reject(_this._createUnautorizedError('User does not have sufficient permissions'));
            }
        });
    };
    AuthenticatedOperationBase.prototype._createUnautorizedError = function (errorMessage) {
        var error = new unauthorizedError_1.UnauthorizedError();
        error.message = errorMessage;
        return error;
    };
    AuthenticatedOperationBase.prototype._userHasPermissions = function (userPermissions) {
        if (userPermissions.indexOf(globalPermission_1.GlobalPermission.ADMIN) >= 0) {
            return true;
        }
        var requiredPermissions = this.sufficientOperationGlobalPermissions;
        for (var i = 0; i < userPermissions.length; i++) {
            var userPermission = userPermissions[i];
            if (requiredPermissions.indexOf(userPermission) >= 0) {
                return true;
            }
        }
        return false;
    };
    return AuthenticatedOperationBase;
}(operationBase_1.OperationBase));
exports.AuthenticatedOperationBase = AuthenticatedOperationBase;
//# sourceMappingURL=authenticatedOperationBase.js.map