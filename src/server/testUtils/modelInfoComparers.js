"use strict";
var ModelInfoComparers = (function () {
    function ModelInfoComparers() {
    }
    ModelInfoComparers.compareUserInfos = function (userInfo1, userInfo2) {
        return userInfo1.username.localeCompare(userInfo2.username);
    };
    ModelInfoComparers.compareSkillInfos = function (skillInfo1, skillInfo2) {
        return skillInfo1.name.localeCompare(skillInfo2.name);
    };
    ModelInfoComparers.compareSkillsCreators = function (skillCreator1, skillCreator2) {
        return skillCreator1.skill_id - skillCreator2.skill_id;
    };
    ModelInfoComparers.compareSkillPrerequisiteInfos = function (skillPrerequisiteInfo1, skillPrerequisiteInfo2) {
        return skillPrerequisiteInfo1.skill_id - skillPrerequisiteInfo2.skill_id;
    };
    ModelInfoComparers.compareTeamInfos = function (teamInfo1, teamInfo2) {
        return teamInfo1.name.localeCompare(teamInfo2.name);
    };
    ModelInfoComparers.compareTeamsCreators = function (teamCreator1, teamCreator2) {
        return teamCreator1.team_id - teamCreator2.team_id;
    };
    ModelInfoComparers.compareTeamSkillInfos = function (teamSkillInfo1, teamSkillInfo2) {
        if (teamSkillInfo1.team_id !== teamSkillInfo2.team_id) {
            return teamSkillInfo1.team_id - teamSkillInfo2.team_id;
        }
        return teamSkillInfo1.skill_id - teamSkillInfo2.skill_id;
    };
    return ModelInfoComparers;
}());
exports.ModelInfoComparers = ModelInfoComparers;
//# sourceMappingURL=modelInfoComparers.js.map