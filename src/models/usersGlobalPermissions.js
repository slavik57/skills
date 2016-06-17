"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var modelBase_1 = require("./modelBase");
var bookshelf_1 = require('../../bookshelf');
var UserGlobalPermissions = (function (_super) {
    __extends(UserGlobalPermissions, _super);
    function UserGlobalPermissions() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(UserGlobalPermissions.prototype, "tableName", {
        get: function () { return 'users_global_permissions'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserGlobalPermissions, "userIdAttribute", {
        get: function () { return 'user_id'; },
        enumerable: true,
        configurable: true
    });
    UserGlobalPermissions.collection = function (permissions, options) {
        return new UsersGlobalPermissions(permissions, options);
    };
    return UserGlobalPermissions;
}(modelBase_1.ModelBase));
exports.UserGlobalPermissions = UserGlobalPermissions;
var UsersGlobalPermissions = (function (_super) {
    __extends(UsersGlobalPermissions, _super);
    function UsersGlobalPermissions() {
        _super.apply(this, arguments);
        this.model = UserGlobalPermissions;
    }
    UsersGlobalPermissions.clearAll = function () {
        return new UsersGlobalPermissions().query().del();
    };
    return UsersGlobalPermissions;
}(bookshelf_1.bookshelf.Collection));
exports.UsersGlobalPermissions = UsersGlobalPermissions;
//# sourceMappingURL=usersGlobalPermissions.js.map