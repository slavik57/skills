"use strict";
var globalPermission_1 = require("../models/enums/globalPermission");
var user_1 = require('../models/user');
var usersGlobalPermissions_1 = require('../models/usersGlobalPermissions');
var bookshelf_1 = require('../../bookshelf');
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
    UserDataHandler.addGlobalPermission = function (username, permissionsToAdd) {
        var _this = this;
        return bookshelf_1.bookshelf.transaction(function () { return _this._addGlobalPermissionInternal(username, permissionsToAdd); });
    };
    UserDataHandler.getUserGlobalPermissions = function (username) {
        var _this = this;
        return this._fetchUserGlobalPermissionsByUsername(username)
            .then(function (usersGlobalPermissions) {
            return _this._convertPermissionsCollectionsToGlobalPermissions(usersGlobalPermissions);
        });
    };
    UserDataHandler.getTeams = function (userName) {
        var _this = this;
        return this.getUser(userName)
            .then(function (user) { return _this._fetchUserTeams(user); });
    };
    UserDataHandler.getUser = function (username) {
        return this._buildUserQuery(username).fetch();
    };
    UserDataHandler._buildUserQuery = function (username) {
        var queryCondition = {};
        queryCondition[user_1.User.usernameAttribute] = username;
        return new user_1.User()
            .query({ where: queryCondition });
    };
    UserDataHandler._fetchUserGlobalPermissionsByUsername = function (username) {
        var _this = this;
        return this.getUser(username)
            .then(function (user) { return _this._fetchUserGlobalPermissions(user); });
    };
    UserDataHandler._fetchUserGlobalPermissions = function (user) {
        if (!user) {
            return Promise.resolve(new usersGlobalPermissions_1.UsersGlobalPermissions());
        }
        return user.getGlobalPermissions().fetch();
    };
    UserDataHandler._convertPermissionsCollectionsToGlobalPermissions = function (usersGlobalPermissions) {
        var permissions = usersGlobalPermissions.toArray();
        return _.map(permissions, function (_) { return globalPermission_1.GlobalPermission[_.attributes.global_permissions]; });
    };
    UserDataHandler._fetchUserTeams = function (user) {
        if (!user) {
            return Promise.resolve([]);
        }
        return user.getTeams();
    };
    UserDataHandler._addGlobalPermissionInternal = function (username, permissionsToAdd) {
        var _this = this;
        var userPromise = this.getUser(username);
        var permissionsPromise = userPromise.then(function (user) { return _this._fetchUserGlobalPermissions(user); });
        return Promise.all([userPromise, permissionsPromise])
            .then(function (results) {
            var user = results[0];
            var existingPermissionsCollection = results[1];
            return _this._addNotExistingGlobalPermissions(user.id, existingPermissionsCollection, permissionsToAdd);
        });
    };
    UserDataHandler._addNotExistingGlobalPermissions = function (userId, existingPermissionsCollection, permissionsToAdd) {
        var existingPermissions = this._convertPermissionsCollectionsToGlobalPermissions(existingPermissionsCollection);
        var newPermissions = _.difference(permissionsToAdd, existingPermissions);
        var newUserPermissions = this._createUserGlobalPermission(userId, newPermissions);
        var newUserPermissionsPromise = _.map(newUserPermissions, function (_permission) { return _permission.save(); });
        return Promise.all(newUserPermissionsPromise);
    };
    UserDataHandler._createUserGlobalPermission = function (userId, permissions) {
        var _this = this;
        var userPermissionInfos = _.map(permissions, function (_permission) { return _this._createUserGlobalPermissionInfo(userId, _permission); });
        return _.map(userPermissionInfos, function (_info) { return new usersGlobalPermissions_1.UserGlobalPermissions(_info); });
    };
    UserDataHandler._createUserGlobalPermissionInfo = function (userId, permission) {
        return {
            user_id: userId,
            global_permissions: globalPermission_1.GlobalPermission[permission]
        };
    };
    return UserDataHandler;
}());
exports.UserDataHandler = UserDataHandler;
