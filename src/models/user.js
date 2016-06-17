"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var teamSkillUpvote_1 = require("./teamSkillUpvote");
var modelBase_1 = require("./modelBase");
var bookshelf_1 = require('../../bookshelf');
var Promise = require('bluebird');
var validator = require('validator');
var _ = require('lodash');
var typesValidator_1 = require('../commonUtils/typesValidator');
var usersGlobalPermissions_1 = require('./usersGlobalPermissions');
var team_1 = require('./team');
var teamMember_1 = require('./teamMember');
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
    Object.defineProperty(User, "dependents", {
        get: function () {
            return [
                User.relatedUserGlobalPermissionsAttribute,
                User.relatedTeamMembersAttribute,
                User.relatedTeamSkillUpvotesAttribute
            ];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User, "usernameAttribute", {
        get: function () { return 'username'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User, "relatedUserGlobalPermissionsAttribute", {
        get: function () { return 'globalPermissions'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User, "relatedTeamMembersAttribute", {
        get: function () { return 'teamMembers'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User, "relatedTeamSkillUpvotesAttribute", {
        get: function () { return 'teamSkillUpvotes'; },
        enumerable: true,
        configurable: true
    });
    User.collection = function (users, options) {
        return new Users(users, options);
    };
    User.prototype.initialize = function () {
        var _this = this;
        this.on('saving', function (user) { return _this._validateUser(user); });
    };
    User.prototype._validateUser = function (user) {
        if ('email' in this.attributes &&
            !validator.isEmail(this.attributes.email)) {
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
        return Promise.resolve(true);
    };
    User.prototype.globalPermissions = function () {
        return this.hasMany(usersGlobalPermissions_1.UserGlobalPermissions, usersGlobalPermissions_1.UserGlobalPermissions.userIdAttribute);
    };
    User.prototype.teamMembers = function () {
        return this.hasMany(teamMember_1.TeamMember, teamMember_1.TeamMember.userIdAttribute);
    };
    User.prototype.teamSkillUpvotes = function () {
        return this.hasMany(teamSkillUpvote_1.TeamSkillUpvote, teamSkillUpvote_1.TeamSkillUpvote.userIdAttribute);
    };
    User.prototype.getTeams = function () {
        var _this = this;
        return this.belongsToMany(team_1.Team)
            .withPivot([teamMember_1.TeamMember.isAdminAttribute])
            .through(teamMember_1.TeamMember, teamMember_1.TeamMember.userIdAttribute, teamMember_1.TeamMember.teamIdAttribute)
            .fetch()
            .then(function (teamsCollection) {
            var teams = teamsCollection.toArray();
            return _.map(teams, function (_team) { return _this._convertTeamToTeamOfAUser(_team); });
        });
    };
    User.prototype._convertTeamToTeamOfAUser = function (team) {
        var teamMember = team.pivot;
        var isAdmin = teamMember.attributes.is_admin;
        return {
            team: team,
            isAdmin: isAdmin
        };
    };
    return User;
}(modelBase_1.ModelBase));
exports.User = User;
var Users = (function (_super) {
    __extends(Users, _super);
    function Users() {
        _super.apply(this, arguments);
        this.model = User;
    }
    Users.clearAll = function () {
        return new Users().query().del();
    };
    return Users;
}(bookshelf_1.bookshelf.Collection));
exports.Users = Users;
//# sourceMappingURL=user.js.map