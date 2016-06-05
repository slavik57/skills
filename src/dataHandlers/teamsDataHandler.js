"use strict";
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
    TeamsDataHandler.upvoteTeamSkill = function (teamId, skillId) {
        var _this = this;
        return bookshelf_1.bookshelf.transaction(function (transaction) {
            return _this._upvodeTeamSkillInternal(teamId, skillId);
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
    TeamsDataHandler._upvodeTeamSkillInternal = function (teamId, skillId) {
        var _this = this;
        var queryCondition = {};
        queryCondition[teamSkill_1.TeamSkill.teamIdAttribute] = teamId;
        queryCondition[teamSkill_1.TeamSkill.skillIdAttribute] = skillId;
        return new teamSkill_1.TeamSkill(queryCondition)
            .fetch()
            .then(function (teamSkill) {
            var newUpvotes = teamSkill.attributes.upvotes + 1;
            return _this._updateTeamSkillUpvotes(teamSkill, newUpvotes);
        });
    };
    TeamsDataHandler._updateTeamSkillUpvotes = function (teamSkill, newUpvotes) {
        var updateAttributes = {};
        updateAttributes[teamSkill_1.TeamSkill.upvotesAttribute] = newUpvotes;
        var saveOptions = {
            patch: true,
            method: 'update'
        };
        return teamSkill.save(updateAttributes, saveOptions);
    };
    return TeamsDataHandler;
}());
exports.TeamsDataHandler = TeamsDataHandler;
