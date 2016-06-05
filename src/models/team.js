"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var skill_1 = require("./skill");
var bookshelf_1 = require('../../bookshelf');
var Promise = require('bluebird');
var _ = require('lodash');
var typesValidator_1 = require('../commonUtils/typesValidator');
var user_1 = require('./user');
var teamMember_1 = require('./teamMember');
var teamSkill_1 = require('./teamSkill');
var Team = (function (_super) {
    __extends(Team, _super);
    function Team() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(Team.prototype, "tableName", {
        get: function () { return 'teams'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Team.prototype, "idAttribute", {
        get: function () { return 'id'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Team, "nameAttribute", {
        get: function () { return 'name'; },
        enumerable: true,
        configurable: true
    });
    Team.prototype.initialize = function () {
        var _this = this;
        this.on('saving', function (team) { return _this.validateTeam(team); });
    };
    Team.prototype.validateTeam = function (team) {
        if (!typesValidator_1.TypesValidator.isLongEnoughString(team.attributes.name, 1)) {
            return Promise.reject('The team name must not be empty');
        }
        return Promise.resolve(true);
    };
    Team.prototype.getTeamMembers = function () {
        var _this = this;
        return this.belongsToMany(user_1.User)
            .withPivot([teamMember_1.TeamMember.isAdminAttribute])
            .through(teamMember_1.TeamMember, teamMember_1.TeamMember.teamIdAttribute, teamMember_1.TeamMember.userIdAttribute)
            .fetch()
            .then(function (usersCollection) {
            var users = usersCollection.toArray();
            return _.map(users, function (_user) { return _this._convertUserToUserOfATeam(_user); });
        });
    };
    Team.prototype.getTeamSkills = function () {
        var _this = this;
        return this.belongsToMany(skill_1.Skill)
            .withPivot([teamSkill_1.TeamSkill.upvotesAttribute])
            .through(teamSkill_1.TeamSkill, teamSkill_1.TeamSkill.teamIdAttribute, teamSkill_1.TeamSkill.skillIdAttribute)
            .fetch()
            .then(function (skillsCollection) {
            var skills = skillsCollection.toArray();
            return _.map(skills, function (_skill) { return _this._convertSkillToSkillOfATeam(_skill); });
        });
    };
    Team.prototype._convertUserToUserOfATeam = function (user) {
        return {
            user: user,
            isAdmin: user.pivot.attributes.is_admin
        };
    };
    Team.prototype._convertSkillToSkillOfATeam = function (skill) {
        return {
            skill: skill,
            upvotes: skill.pivot.attributes.upvotes
        };
    };
    return Team;
}(bookshelf_1.bookshelf.Model));
exports.Team = Team;
var Teams = (function (_super) {
    __extends(Teams, _super);
    function Teams() {
        _super.apply(this, arguments);
        this.model = Team;
    }
    Teams.clearAll = function () {
        var promises = [];
        return new Teams().fetch().then(function (teams) {
            teams.each(function (team) {
                var promise = team.destroy(null);
                promises.push(promise);
            });
            return Promise.all(promises);
        });
    };
    return Teams;
}(bookshelf_1.bookshelf.Collection));
exports.Teams = Teams;
