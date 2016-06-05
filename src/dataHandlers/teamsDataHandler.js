"use strict";
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
            .then(function (team) { return _this.fetchMembersOfTeam(team); });
    };
    TeamsDataHandler.getTeamSkills = function (teamName) {
        var _this = this;
        return this.getTeam(teamName)
            .then(function (team) { return _this.fetchSkillsOfTeam(team); });
    };
    TeamsDataHandler.getTeam = function (teamName) {
        return new team_1.Team()
            .query({ where: { name: teamName } })
            .fetch();
    };
    TeamsDataHandler.fetchMembersOfTeam = function (team) {
        if (!team) {
            return Promise.resolve([]);
        }
        return team.getTeamMembers();
    };
    TeamsDataHandler.fetchSkillsOfTeam = function (team) {
        if (!team) {
            return Promise.resolve([]);
        }
        return team.getTeamSkills();
    };
    return TeamsDataHandler;
}());
exports.TeamsDataHandler = TeamsDataHandler;
