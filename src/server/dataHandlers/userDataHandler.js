"use strict";
var stringManipulator_1 = require("../../common/stringManipulator");
var querySelectors_1 = require("./querySelectors");
var globalPermission_1 = require("../models/enums/globalPermission");
var user_1 = require('../models/user');
var usersGlobalPermissions_1 = require('../models/usersGlobalPermissions');
var bookshelf_1 = require('../../../bookshelf');
var _ = require('lodash');
var bluebirdPromise = require('bluebird');
var UserDataHandler = (function () {
    function UserDataHandler() {
    }
    UserDataHandler.createUser = function (userInfo) {
        return new user_1.User(userInfo).save();
    };
    UserDataHandler.createUserWithPermissions = function (userInfo, permissionsToAdd) {
        var _this = this;
        return bookshelf_1.bookshelf.transaction(function (_transaction) {
            return _this._createUserWithPermissions(userInfo, permissionsToAdd, _transaction);
        });
    };
    UserDataHandler.updateUserDetails = function (userId, username, email, firstName, lastName) {
        var updateValues = {};
        updateValues[user_1.User.usernameAttribute] = username;
        updateValues[user_1.User.emailAttribute] = email || null;
        updateValues[user_1.User.firstNameAttribute] = firstName;
        updateValues[user_1.User.lastNameAttribute] = lastName;
        return this._updateUser(userId, updateValues);
    };
    UserDataHandler.updateUserPassword = function (userId, newPasswordHash) {
        var updateValues = {};
        updateValues[user_1.User.passwordHashAttribute] = newPasswordHash;
        return this._updateUser(userId, updateValues);
    };
    UserDataHandler.deleteUser = function (userId) {
        return this._initializeUserByIdQuery(userId).destroy();
    };
    UserDataHandler.getUsers = function () {
        return new user_1.Users().fetch()
            .then(function (users) {
            return users.toArray();
        });
    };
    UserDataHandler.getUsersByPartialUsername = function (partialUsername) {
        var likePartialUsername = this._createLikeQueryValue(partialUsername);
        return new user_1.Users().query(function (_queryBuilder) {
            _queryBuilder.where(user_1.User.usernameAttribute, querySelectors_1.QuerySelectors.LIKE, likePartialUsername);
        }).fetch()
            .then(function (_usersCollection) { return _usersCollection.toArray(); });
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
    UserDataHandler.getUserByUsername = function (username) {
        return this._initializeUserByUsernameQuery(username).fetch();
    };
    UserDataHandler.getUserByEmail = function (email) {
        return this._initializeUserByEmailQuery(email).fetch();
    };
    UserDataHandler._createUserWithPermissions = function (userInfo, permissionsToAdd, transaction) {
        var _this = this;
        var saveOptions = {
            transacting: transaction
        };
        return new user_1.User(userInfo).save(null, saveOptions)
            .then(function (_user) {
            return _this._addGlobalPermissionInternal(_user.id, permissionsToAdd, transaction)
                .then(function () { return _user; });
        });
    };
    UserDataHandler._initializeUserByIdQuery = function (teamId) {
        var queryCondition = {};
        queryCondition[user_1.User.idAttribute] = teamId;
        return new user_1.User(queryCondition);
    };
    UserDataHandler._initializeUserByUsernameQuery = function (username) {
        var queryCondition = {};
        queryCondition[user_1.User.usernameAttribute] = username;
        return new user_1.User(queryCondition);
    };
    UserDataHandler._initializeUserByEmailQuery = function (email) {
        var queryCondition = {};
        queryCondition[user_1.User.emailAttribute] = email;
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
                var error = new Error();
                error.message = 'User does not exist';
                return bluebirdPromise.reject(error);
            }
            var existingPermissionsCollection = user.relations.globalPermissions;
            return _this._addNotExistingGlobalPermissions(user.id, existingPermissionsCollection, permissionsToAdd, transaction);
        });
    };
    UserDataHandler._removeGlobalPermissionInternal = function (userId, permissionsToRemove, transaction) {
        var user = this._initializeUserByIdQuery(userId);
        var permissionsToDeteleQuery = this._createUserGlobalPermissionInfos(userId, permissionsToRemove);
        var permissionsToDelete = _.map(permissionsToDeteleQuery, function (_info) { return new usersGlobalPermissions_1.UserGlobalPermissions().where(_info); });
        var destroyOptions = {
            require: false,
            cascadeDelete: false,
            transacting: transaction
        };
        var deleteUserPermissionsPromise = _.map(permissionsToDelete, function (_permission) { return _permission.destroy(destroyOptions); });
        return bluebirdPromise.all(deleteUserPermissionsPromise);
    };
    UserDataHandler._addNotExistingGlobalPermissions = function (userId, existingPermissionsCollection, permissionsToAdd, transaction) {
        var existingPermissions = this._convertPermissionsCollectionsToGlobalPermissions(existingPermissionsCollection);
        var newPermissions = _.difference(permissionsToAdd, existingPermissions);
        newPermissions = _.uniq(newPermissions);
        var newUserPermissions = this._createUserGlobalPermission(userId, newPermissions);
        var saveOptions = {
            transacting: transaction
        };
        var newUserPermissionsPromise = _.map(newUserPermissions, function (_permission) { return _permission.save(null, saveOptions); });
        return bluebirdPromise.all(newUserPermissionsPromise);
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
    UserDataHandler._updateUser = function (userId, updateValues) {
        var saveOptions = {
            method: 'update'
        };
        return this._initializeUserByIdQuery(userId).fetch().then(function (_user) {
            return _user.save(updateValues, saveOptions);
        });
    };
    UserDataHandler._createLikeQueryValue = function (value) {
        var fixedValue = this._fixValueForLikeQuery(value);
        console.log(fixedValue);
        return '%' + fixedValue + '%';
    };
    UserDataHandler._fixValueForLikeQuery = function (value) {
        var noLodash = stringManipulator_1.StringManipulator.replaceAll(value, '_', '\\_');
        var noPercentage = stringManipulator_1.StringManipulator.replaceAll(noLodash, '%', '\\%');
        return noPercentage;
    };
    return UserDataHandler;
}());
exports.UserDataHandler = UserDataHandler;
//# sourceMappingURL=userDataHandler.js.map