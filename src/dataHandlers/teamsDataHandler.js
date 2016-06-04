"use strict";
var team_1 = require('../models/team');
var teamMember_1 = require('../models/teamMember');
var TeamsDataHandler = (function () {
    function TeamsDataHandler() {
    }
    TeamsDataHandler.createTeam = function (teamInfo) {
        return new team_1.Team(teamInfo).save();
    };
    TeamsDataHandler.addTeamMember = function (teamMemberInfo) {
        return new teamMember_1.TeamMember(teamMemberInfo).save();
    };
    TeamsDataHandler.getTeamMembers = function (teamName) {
        return this.getTeam(teamName)
            .then(function (team) { return team.getTeamMembers().fetch(); })
            .then(function (teamMembers) { return teamMembers.toArray(); });
    };
    TeamsDataHandler.getTeam = function (teamName) {
        return new team_1.Team()
            .query({ where: { name: teamName } })
            .fetch();
    };
    return TeamsDataHandler;
}());
exports.TeamsDataHandler = TeamsDataHandler;
