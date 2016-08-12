"use strict";
var ModelInfoMockFactory = (function () {
    function ModelInfoMockFactory() {
    }
    ModelInfoMockFactory.createUserInfo = function (userNumber, suffix) {
        if (suffix === void 0) { suffix = ''; }
        return {
            username: 'username' + userNumber + suffix,
            password_hash: 'password_hash' + userNumber + suffix,
            email: 'email' + userNumber + suffix + '@gmail.com',
            firstName: 'firstName' + userNumber + suffix,
            lastName: 'lastName' + userNumber + suffix
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
    ModelInfoMockFactory.createTeamMemberInfo = function (team, user, isAdmin) {
        if (isAdmin === void 0) { isAdmin = false; }
        return {
            team_id: team.id,
            user_id: user.id,
            is_admin: isAdmin
        };
    };
    ModelInfoMockFactory.createSkillPrerequisiteInfo = function (skill, skillPrerequisite) {
        return {
            skill_id: skill.id,
            skill_prerequisite_id: skillPrerequisite.id
        };
    };
    return ModelInfoMockFactory;
}());
exports.ModelInfoMockFactory = ModelInfoMockFactory;
//# sourceMappingURL=modelInfoMockFactory.js.map