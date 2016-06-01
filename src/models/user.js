"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var bookshelf_1 = require('../../bookshelf');
var User = (function (_super) {
    __extends(User, _super);
    function User() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(User.prototype, "tableName", {
        get: function () { return 'users'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "idAttribute", {
        get: function () { return 'id'; },
        enumerable: true,
        configurable: true
    });
    return User;
}(bookshelf_1.bookshelf.Model));
exports.User = User;
var Users = (function (_super) {
    __extends(Users, _super);
    function Users() {
        _super.apply(this, arguments);
        this.model = User;
    }
    return Users;
}(bookshelf_1.bookshelf.Collection));
exports.Users = Users;
