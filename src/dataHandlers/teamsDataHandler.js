"use strict";
var team_1 = require("../models/team");
var teamSkillUpvote_1 = require("../models/teamSkillUpvote");
var bookshelf_1 = require('../../bookshelf');
var team_2 = require('../models/team');
var teamMember_1 = require('../models/teamMember');
var teamSkill_1 = require('../models/teamSkill');
var TeamsDataHandler = (function () {
    function TeamsDataHandler() {
    }
    TeamsDataHandler.createTeam = function (teamInfo) {
        return new team_2.Team(teamInfo).save();
    };
    TeamsDataHandler.deleteTeam = function (teamId) {
        return this._initializeTeamByIdQuery(teamId).destroy();
    };
    TeamsDataHandler.addTeamMember = function (teamMemberInfo) {
        return new teamMember_1.TeamMember(teamMemberInfo).save();
    };
    TeamsDataHandler.removeTeamMember = function (teamId, userId) {
        var query = {};
        query[teamMember_1.TeamMember.teamIdAttribute] = teamId;
        query[teamMember_1.TeamMember.userIdAttribute] = userId;
        var destroyOptions = {
            require: false,
            cascadeDelete: false
        };
        return new teamMember_1.TeamMember().where(query).destroy(destroyOptions);
    };
    TeamsDataHandler.addTeamSkill = function (teamSkillInfo) {
        return new teamSkill_1.TeamSkill(teamSkillInfo).save();
    };
    TeamsDataHandler.removeTeamSkill = function (teamId, skillId) {
        var query = {};
        query[teamSkill_1.TeamSkill.teamIdAttribute] = teamId;
        query[teamSkill_1.TeamSkill.skillIdAttribute] = skillId;
        return new teamSkill_1.TeamSkill().where(query).fetch()
            .then(function (_teamSkill) {
            if (!_teamSkill) {
                return Promise.resolve(null);
            }
            return _teamSkill.destroy();
        });
    };
    TeamsDataHandler.getTeamMembers = function (teamId) {
        var team = this._initializeTeamByIdQuery(teamId);
        return team.getTeamMembers();
    };
    TeamsDataHandler.getTeamSkills = function (teamId) {
        var team = this._initializeTeamByIdQuery(teamId);
        return team.getTeamSkills();
    };
    TeamsDataHandler.getSkillsOfTeams = function () {
        return team_1.Teams.getSkillsOfTeams();
    };
    TeamsDataHandler.getTeam = function (teamId) {
        var team = this._initializeTeamByIdQuery(teamId);
        return team.fetch();
    };
    TeamsDataHandler.getTeams = function () {
        return new team_1.Teams().fetch()
            .then(function (_teamsCollection) {
            return _teamsCollection.toArray();
        });
    };
    TeamsDataHandler.getNumberOfTeams = function () {
        return new team_1.Teams().count()
            .then(function (_numberOfTeams) {
            return Number(_numberOfTeams);
        });
    };
    TeamsDataHandler.upvoteTeamSkill = function (teamSkillId, upvotingUserId) {
        var upvoteInfo = {
            team_skill_id: teamSkillId,
            user_id: upvotingUserId
        };
        return new teamSkillUpvote_1.TeamSkillUpvote(upvoteInfo).save();
    };
    TeamsDataHandler.removeUpvoteForTeamSkill = function (teamSkillId, upvotedUserId) {
        var query = {};
        query[teamSkillUpvote_1.TeamSkillUpvote.teamSkillIdAttribute] = teamSkillId;
        query[teamSkillUpvote_1.TeamSkillUpvote.userIdAttribute] = upvotedUserId;
        var destroyOptions = {
            require: true,
            cascadeDelete: false
        };
        return new teamSkillUpvote_1.TeamSkillUpvote()
            .where(query).destroy(destroyOptions);
    };
    TeamsDataHandler.setAdminRights = function (teamId, userId, newAdminRights) {
        var _this = this;
        return bookshelf_1.bookshelf.transaction(function (_transaction) {
            return _this._setAdminRightsInternal(teamId, userId, newAdminRights, _transaction);
        });
    };
    TeamsDataHandler._initializeTeamByIdQuery = function (teamId) {
        var queryCondition = {};
        queryCondition[team_2.Team.idAttribute] = teamId;
        return new team_2.Team(queryCondition);
    };
    TeamsDataHandler._setAdminRightsInternal = function (teamId, userId, newAdminRights, transaction) {
        var queryCondition = {};
        queryCondition[teamMember_1.TeamMember.teamIdAttribute] = teamId;
        queryCondition[teamMember_1.TeamMember.userIdAttribute] = userId;
        var updateAttributes = {};
        updateAttributes[teamMember_1.TeamMember.isAdminAttribute] = newAdminRights;
        var saveOptions = {
            patch: true,
            method: 'update',
            transacting: transaction
        };
        var fetchOptions = {
            transacting: transaction
        };
        return new teamMember_1.TeamMember(queryCondition)
            .fetch(fetchOptions)
            .then(function (teamMember) {
            return teamMember.save(updateAttributes, saveOptions);
        });
    };
    return TeamsDataHandler;
}());
exports.TeamsDataHandler = TeamsDataHandler;
