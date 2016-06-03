"use strict";
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
        return new usersGlobalPermissions_1.UsersGlobalPermissions()
            .query({ where: { username: username } })
            .fetch()
            .then(function (usersGlobalPermissions) {
            var permissions = usersGlobalPermissions.toArray();
            return _.map(permissions, function (_) { return usersGlobalPermissions_1.GlobalPermission[_.attributes.global_permissions]; });
        });
    };
    return UserDataHandler;
}());
exports.UserDataHandler = UserDataHandler;
