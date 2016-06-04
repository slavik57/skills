"use strict";
var skill_1 = require('../models/skill');
var skillPrerequisite_1 = require('../models/skillPrerequisite');
var SkillsDataHandler = (function () {
    function SkillsDataHandler() {
    }
    SkillsDataHandler.createSkill = function (skillInfo) {
        return new skill_1.Skill(skillInfo).save();
    };
    SkillsDataHandler.getSkills = function () {
        return new skill_1.Skills().fetch()
            .then(function (skills) {
            return skills.toArray();
        });
    };
    SkillsDataHandler.addSkillPrerequisite = function (skillPrerequisiteInfo) {
        return new skillPrerequisite_1.SkillPrerequisite(skillPrerequisiteInfo).save();
    };
    SkillsDataHandler.getSkillsPrerequisites = function () {
        return new skillPrerequisite_1.SkillPrerequisites().fetch()
            .then(function (skillPrerequisites) {
            return skillPrerequisites.toArray();
        });
    };
    SkillsDataHandler.getSkillPrerequisites = function (skillName) {
        return this.getSkill(skillName)
            .then(function (skill) { return skill.prerequisites().fetch(); })
            .then(function (skills) { return skills.toArray(); });
    };
    SkillsDataHandler.getSkillContributions = function (skillName) {
        return this.getSkill(skillName)
            .then(function (skill) { return skill.contributions().fetch(); })
            .then(function (skills) { return skills.toArray(); });
    };
    SkillsDataHandler.getSkill = function (skillName) {
        return new skill_1.Skill()
            .query({ where: { name: skillName } })
            .fetch();
    };
    return SkillsDataHandler;
}());
exports.SkillsDataHandler = SkillsDataHandler;
