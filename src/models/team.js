"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var modelBase_1 = require("./modelBase");
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
    Object.defineProperty(Team, "dependents", {
        get: function () {
            return [
                Team.relatedTeamMembersAttribute,
                Team.relatedTeamSkillsAttribute
            ];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Team, "nameAttribute", {
        get: function () { return 'name'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Team, "relatedTeamMembersAttribute", {
        get: function () { return 'teamMembers'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Team, "relatedTeamSkillsAttribute", {
        get: function () { return 'teamSkills'; },
        enumerable: true,
        configurable: true
    });
    Team.collection = function (teams, options) {
        return new Teams(teams, options);
    };
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
    Team.prototype.teamMembers = function () {
        return this.hasMany(teamMember_1.TeamMember, teamMember_1.TeamMember.teamIdAttribute);
    };
    Team.prototype.teamSkills = function () {
        return this.hasMany(teamSkill_1.TeamSkill, teamSkill_1.TeamSkill.teamIdAttribute);
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
        var fetchOptions = {
            withRelated: [
                teamSkill_1.TeamSkill.relatedTeamSkillUpvotesAttribute,
                teamSkill_1.TeamSkill.relatedSkillAttribute
            ]
        };
        return this.teamSkills()
            .fetch(fetchOptions)
            .then(function (teamSkillsCollection) {
            var teamSkills = teamSkillsCollection.toArray();
            return _.map(teamSkills, function (_skill) { return _this._convertTeamSkillToSkillOfATeam(_skill); });
        });
    };
    Team.prototype._convertUserToUserOfATeam = function (user) {
        return {
            user: user,
            isAdmin: user.pivot.attributes.is_admin
        };
    };
    Team.prototype._convertTeamSkillToSkillOfATeam = function (teamSkill) {
        var skill = teamSkill.relations.skill;
        var upvotesCollection = teamSkill.relations.upvotes;
        var upvotes = upvotesCollection.toArray();
        var upvotingIds = _.map(upvotes, function (_) { return _.attributes.user_id; });
        return {
            skill: skill,
            upvotingUserIds: upvotingIds
        };
    };
    return Team;
}(modelBase_1.ModelBase));
exports.Team = Team;
var Teams = (function (_super) {
    __extends(Teams, _super);
    function Teams() {
        _super.apply(this, arguments);
        this.model = Team;
    }
    Teams.clearAll = function () {
        return new Teams().query().del();
    };
    Teams.getSkillsOfTeams = function () {
        var _this = this;
        var fetchOptions = {
            withRelated: [
                Team.relatedTeamSkillsAttribute
            ]
        };
        return new Teams()
            .fetch(fetchOptions)
            .then(function (_teamsCollection) {
            return _teamsCollection.toArray();
        })
            .then(function (_teams) {
            return _.map(_teams, function (_team) { return _this._convertToSkillsOfATeam(_team); });
        });
    };
    Teams._convertToSkillsOfATeam = function (team) {
        var teamSkills = team.relations.teamSkills.toArray();
        return {
            team: team,
            skillIds: _.map(teamSkills, function (_) { return _.attributes.skill_id; })
        };
    };
    return Teams;
}(bookshelf_1.bookshelf.Collection));
exports.Teams = Teams;
