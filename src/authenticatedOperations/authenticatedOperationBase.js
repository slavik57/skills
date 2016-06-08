"use strict";
var userDataHandler_1 = require("../dataHandlers/userDataHandler");
var globalPermission_1 = require("../models/enums/globalPermission");
var AuthenticatedOperationBase = (function () {
    function AuthenticatedOperationBase(_userId) {
        this._userId = _userId;
    }
    Object.defineProperty(AuthenticatedOperationBase.prototype, "userId", {
        get: function () { return this._userId; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthenticatedOperationBase.prototype, "operationRequiredPermissions", {
        get: function () { return []; },
        enumerable: true,
        configurable: true
    });
    AuthenticatedOperationBase.prototype.execute = function () {
        var _this = this;
        var userPermissionsPromise = userDataHandler_1.UserDataHandler.getUserGlobalPermissions(this.userId);
        return userPermissionsPromise.then(function (_permissions) {
            return _this._executeIfSufficientPermissions(_permissions);
        });
    };
    AuthenticatedOperationBase.prototype.executeOperation = function () {
        throw 'Override the executeOperation method with the operation execution';
    };
    AuthenticatedOperationBase.prototype._executeIfSufficientPermissions = function (userPermissions) {
        if (!this._userHasPermissions(userPermissions)) {
            return Promise.reject('The user does not have sufficient permissions');
        }
        return this.executeOperation();
    };
    AuthenticatedOperationBase.prototype._userHasPermissions = function (userPermissions) {
        if (userPermissions.indexOf(globalPermission_1.GlobalPermission.ADMIN) >= 0) {
            return true;
        }
        var requiredPermissions = this.operationRequiredPermissions;
        for (var i = 0; i < userPermissions.length; i++) {
            var userPermission = userPermissions[i];
            if (requiredPermissions.indexOf(userPermission) >= 0) {
                return true;
            }
        }
        return false;
    };
    return AuthenticatedOperationBase;
}());
exports.AuthenticatedOperationBase = AuthenticatedOperationBase;
