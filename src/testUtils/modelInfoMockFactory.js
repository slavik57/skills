"use strict";
var ModelInfoMockFactory = (function () {
    function ModelInfoMockFactory() {
    }
    ModelInfoMockFactory.createUserInfo = function (userNumber) {
        return {
            username: 'username' + userNumber,
            password_hash: 'password_hash' + userNumber,
            email: 'email' + userNumber + '@gmail.com',
            firstName: 'firstName' + userNumber,
            lastName: 'lastName' + userNumber
        };
    };
    ModelInfoMockFactory.createSkillInfo = function (skillName) {
        return {
            name: skillName
        };
    };
    ModelInfoMockFactory.createTeamInfo = function (teamName) {
        return {
            name: teamName
        };
    };
    ModelInfoMockFactory.createTeamSkillInfo = function (team, skill) {
        return {
            team_id: team.id,
            skill_id: skill.id
        };
    };
    ModelInfoMockFactory.createTeamSkillUpvoteInfo = function (teamSkill, user) {
        return {
            team_skill_id: teamSkill.id,
            user_id: user.id
        };
    };
    ModelInfoMockFactory.createTeamMemberInfo = function (team, user) {
        return {
            team_id: team.id,
            user_id: user.id,
            is_admin: false
        };
    };
    return ModelInfoMockFactory;
}());
exports.ModelInfoMockFactory = ModelInfoMockFactory;