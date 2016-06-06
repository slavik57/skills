"use strict";
var teamSkillUpvote_1 = require("../models/teamSkillUpvote");
var bookshelf_1 = require('../../bookshelf');
var team_1 = require('../models/team');
var teamMember_1 = require('../models/teamMember');
var teamSkill_1 = require('../models/teamSkill');
var TeamsDataHandler = (function () {
    function TeamsDataHandler() {
    }
    TeamsDataHandler.createTeam = function (teamInfo) {
        return new team_1.Team(teamInfo).save();
    };
    TeamsDataHandler.addTeamMember = function (teamMemberInfo) {
        return new teamMember_1.TeamMember(teamMemberInfo).save();
    };
    TeamsDataHandler.addTeamSkill = function (teamSkillInfo) {
        return new teamSkill_1.TeamSkill(teamSkillInfo).save();
    };
    TeamsDataHandler.getTeamMembers = function (teamName) {
        var _this = this;
        return this.getTeam(teamName)
            .then(function (team) { return _this._fetchMembersOfTeam(team); });
    };
    TeamsDataHandler.getTeamSkills = function (teamName) {
        var _this = this;
        return this.getTeam(teamName)
            .then(function (team) { return _this._fetchSkillsOfTeam(team); });
    };
    TeamsDataHandler.getTeam = function (teamName) {
        var queryCondition = {};
        queryCondition[team_1.Team.nameAttribute] = teamName;
        return new team_1.Team()
            .query({ where: queryCondition })
            .fetch();
    };
    TeamsDataHandler.upvoteTeamSkill = function (teamSkillId, upvotingUserId) {
        var upvoteInfo = {
            team_skill_id: teamSkillId,
            user_id: upvotingUserId
        };
        return new teamSkillUpvote_1.TeamSkillUpvote(upvoteInfo).save();
    };
    TeamsDataHandler.removeUpvoteForTeamSkill = function (teamSkillId, upvotedUserId) {
        var idQuery = {};
        idQuery[teamSkillUpvote_1.TeamSkillUpvote.teamSkillIdAttribute] = teamSkillId;
        idQuery[teamSkillUpvote_1.TeamSkillUpvote.userIdAttribute] = upvotedUserId;
        var destroyOptions = {
            require: true
        };
        return new teamSkillUpvote_1.TeamSkillUpvote()
            .where(idQuery)
            .destroy(destroyOptions);
    };
    TeamsDataHandler.setAdminRights = function (teamId, userId, newAdminRights) {
        var _this = this;
        return bookshelf_1.bookshelf.transaction(function () {
            return _this._setAdminRightsInternal(teamId, userId, newAdminRights);
        });
    };
    TeamsDataHandler._fetchMembersOfTeam = function (team) {
        if (!team) {
            return Promise.resolve([]);
        }
        return team.getTeamMembers();
    };
    TeamsDataHandler._fetchSkillsOfTeam = function (team) {
        if (!team) {
            return Promise.resolve([]);
        }
        return team.getTeamSkills();
    };
    TeamsDataHandler._setAdminRightsInternal = function (teamId, userId, newAdminRights) {
        var queryCondition = {};
        queryCondition[teamMember_1.TeamMember.teamIdAttribute] = teamId;
        queryCondition[teamMember_1.TeamMember.userIdAttribute] = userId;
        var updateAttributes = {};
        updateAttributes[teamMember_1.TeamMember.isAdminAttribute] = newAdminRights;
        var saveOptions = {
            patch: true,
            method: 'update'
        };
        return new teamMember_1.TeamMember(queryCondition)
            .fetch()
            .then(function (teamMember) {
            return teamMember.save(updateAttributes, saveOptions);
        });
    };
    return TeamsDataHandler;
}());
exports.TeamsDataHandler = TeamsDataHandler;
