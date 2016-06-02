"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var bookshelf_1 = require('../../bookshelf');
var Promise = require('bluebird');
var validator = require('validator');
var typesValidator_1 = require('../commonUtils/typesValidator');
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
    User.prototype.initialize = function () {
        var _this = this;
        this.on('saving', function (user) { return _this.validateUser(user); });
    };
    User.prototype.validateUser = function (user) {
        if (!validator.isEmail(this.attributes.email)) {
            return Promise.reject('Email is not valid');
        }
        if (!typesValidator_1.TypesValidator.isLongEnoughString(this.attributes.username, 1)) {
            return Promise.reject('Username is not valid');
        }
        if (!typesValidator_1.TypesValidator.isLongEnoughString(this.attributes.password_hash, 1)) {
            return Promise.reject('Password is not valid');
        }
        if (!typesValidator_1.TypesValidator.isLongEnoughString(this.attributes.firstName, 1)) {
            return Promise.reject('First name is not valid');
        }
        if (!typesValidator_1.TypesValidator.isLongEnoughString(this.attributes.lastName, 1)) {
            return Promise.reject('Last name is not valid');
        }
        return null;
    };
    return User;
}(bookshelf_1.bookshelf.Model));
exports.User = User;
var Users = (function (_super) {
    __extends(Users, _super);
    function Users() {
        _super.apply(this, arguments);
        this.model = User;
    }
    Users.clearAll = function () {
        var promises = [];
        return new Users().fetch().then(function (users) {
            users.each(function (user) {
                var promise = user.destroy(null);
                promises.push(promise);
            });
            return Promise.all(promises);
        });
    };
    return Users;
}(bookshelf_1.bookshelf.Collection));
exports.Users = Users;
