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
    UserDataHandler.deleteUser = function (userId) {
        var idQuery = {};
        idQuery[user_1.User.idAttribute] = userId;
        return new user_1.User(idQuery).destroy();
    };
    UserDataHandler.getUsers = function () {
        return new user_1.Users().fetch()
            .then(function (users) {
            return users.toArray();
        });
    };
    UserDataHandler.addGlobalPermissions = function (userId, permissionsToAdd) {
        var _this = this;
        return bookshelf_1.bookshelf.transaction(function (_transaction) { return _this._addGlobalPermissionInternal(userId, permissionsToAdd, _transaction); });
    };
    UserDataHandler.removeGlobalPermissions = function (userId, permissionsToRemove) {
        var _this = this;
        return bookshelf_1.bookshelf.transaction(function (_transaction) { return _this._removeGlobalPermissionInternal(userId, permissionsToRemove, _transaction); });
    };
    UserDataHandler.getUserGlobalPermissions = function (userId) {
        var _this = this;
        return this._fetchUserGlobalPermissions(userId)
            .then(function (usersGlobalPermissions) {
            return _this._convertPermissionsCollectionsToGlobalPermissions(usersGlobalPermissions);
        });
    };
    UserDataHandler.getTeams = function (userId) {
        var user = this._initializeUserByIdQuery(userId);
        return user.getTeams();
    };
    UserDataHandler.getUser = function (userId) {
        return this._initializeUserByIdQuery(userId).fetch();
    };
    UserDataHandler._initializeUserByIdQuery = function (teamId) {
        var queryCondition = {};
        queryCondition[user_1.User.idAttribute] = teamId;
        return new user_1.User(queryCondition);
    };
    UserDataHandler._fetchUserGlobalPermissions = function (userId) {
        var user = this._initializeUserByIdQuery(userId);
        return user.globalPermissions().fetch();
    };
    UserDataHandler._convertPermissionsCollectionsToGlobalPermissions = function (usersGlobalPermissions) {
        var permissions = usersGlobalPermissions.toArray();
        return _.map(permissions, function (_) { return globalPermission_1.GlobalPermission[_.attributes.global_permissions]; });
    };
    UserDataHandler._addGlobalPermissionInternal = function (userId, permissionsToAdd, transaction) {
        var _this = this;
        var fetchOptions = {
            withRelated: [user_1.User.relatedUserGlobalPermissionsAttribute],
            require: false,
            transacting: transaction
        };
        return this._initializeUserByIdQuery(userId)
            .fetch(fetchOptions)
            .then(function (user) {
            if (!user) {
                return Promise.reject('User does not exist');
            }
            var existingPermissionsCollection = user.relations.globalPermissions;
            return _this._addNotExistingGlobalPermissions(user.id, existingPermissionsCollection, permissionsToAdd, transaction);
        });
    };
    UserDataHandler._removeGlobalPermissionInternal = function (userId, permissionsToRemove, transaction) {
        var _this = this;
        var user = this._initializeUserByIdQuery(userId);
        var fetchOptions = {
            require: false,
            transacting: transaction
        };
        return user.fetch(fetchOptions)
            .then(function (user) {
            if (!user) {
                return Promise.reject('User does not exist');
            }
            var permissionsToDeteleQuery = _this._createUserGlobalPermissionInfos(user.id, permissionsToRemove);
            var permissionsToDelete = _.map(permissionsToDeteleQuery, function (_info) { return new usersGlobalPermissions_1.UserGlobalPermissions().where(_info); });
            var destroyOptions = {
                require: false,
                cascadeDelete: false,
                transacting: transaction
            };
            var deleteUserPermissionsPromise = _.map(permissionsToDelete, function (_permission) { return _permission.destroy(destroyOptions); });
            return Promise.all(deleteUserPermissionsPromise);
        });
    };
    UserDataHandler._addNotExistingGlobalPermissions = function (userId, existingPermissionsCollection, permissionsToAdd, transaction) {
        var existingPermissions = this._convertPermissionsCollectionsToGlobalPermissions(existingPermissionsCollection);
        var newPermissions = _.difference(permissionsToAdd, existingPermissions);
        newPermissions = _.uniq(newPermissions);
        var newUserPermissions = this._createUserGlobalPermission(userId, newPermissions);
        var saveOptions = {
            transacting: transaction
        };
        var newUserPermissionsPromise = _.map(newUserPermissions, function (_permission) { return _permission.save({}, saveOptions); });
        return Promise.all(newUserPermissionsPromise);
    };
    UserDataHandler._createUserGlobalPermission = function (userId, permissions) {
        var _this = this;
        var userPermissionInfos = _.map(permissions, function (_permission) { return _this._createUserGlobalPermissionInfo(userId, _permission); });
        return _.map(userPermissionInfos, function (_info) { return new usersGlobalPermissions_1.UserGlobalPermissions(_info); });
    };
    UserDataHandler._createUserGlobalPermissionInfos = function (userId, permissions) {
        var _this = this;
        return _.map(permissions, function (_permission) { return _this._createUserGlobalPermissionInfo(userId, _permission); });
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
