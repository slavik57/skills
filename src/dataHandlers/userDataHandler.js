"use strict";
var globalPermission_1 = require("../models/enums/globalPermission");
var user_1 = require('../models/user');
var usersGlobalPermissions_1 = require('../models/usersGlobalPermissions');
var _ = require('lodash');
var UserDataHandler = (function () {
    function UserDataHandler() {
    }
    UserDataHandler.createUser = function (userInfo) {
        return new user_1.User(userInfo).save();
    };
    UserDataHandler.getUsers = function () {
        return new user_1.Users().fetch()
            .then(function (users) {
            return users.toArray();
        });
    };
    UserDataHandler.getUserByUsername = function (userName, require) {
        if (require === void 0) { require = false; }
        return new user_1.User().where({ username: userName }).fetch({ require: require });
    };
    UserDataHandler.getUserGlobalPermissions = function (username) {
        var _this = this;
        return this.getUser(username)
            .then(function (user) { return _this._fetchUserGlobalPermissions(user); })
            .then(function (usersGlobalPermissions) {
            var permissions = usersGlobalPermissions.toArray();
            return _.map(permissions, function (_) { return globalPermission_1.GlobalPermission[_.attributes.global_permissions]; });
        });
    };
    UserDataHandler.getTeams = function (userName) {
        var _this = this;
        return this.getUser(userName)
            .then(function (user) { return _this._fetchUserTeams(user); });
    };
    UserDataHandler.getUser = function (username) {
        return new user_1.User()
            .query({ where: { username: username } })
            .fetch();
    };
    UserDataHandler._fetchUserGlobalPermissions = function (user) {
        if (!user) {
            return Promise.resolve(new usersGlobalPermissions_1.UsersGlobalPermissions());
        }
        return user.getGlobalPermissions().fetch();
    };
    UserDataHandler._fetchUserTeams = function (user) {
        if (!user) {
            return Promise.resolve([]);
        }
        return user.getTeams();
    };
    return UserDataHandler;
}());
exports.UserDataHandler = UserDataHandler;
