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
    ModelInfoComparers.compareSkillPrerequisiteInfos = function (skillPrerequisiteInfo1, skillPrerequisiteInfo2) {
        return skillPrerequisiteInfo1.skill_id - skillPrerequisiteInfo2.skill_id;
    };
    ModelInfoComparers.compareTeamInfos = function (teamInfo1, teamInfo2) {
        return teamInfo1.name.localeCompare(teamInfo2.name);
    };
    return ModelInfoComparers;
}());
exports.ModelInfoComparers = ModelInfoComparers;
