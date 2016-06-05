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
        var _this = this;
        return this.getSkill(skillName)
            .then(function (skill) { return _this.fetchSkillPrerequisitesBySkill(skill); })
            .then(function (skills) { return skills.toArray(); });
    };
    SkillsDataHandler.getSkillContributions = function (skillName) {
        var _this = this;
        return this.getSkill(skillName)
            .then(function (skill) { return _this.fetchContributingSkillsBySkill(skill); })
            .then(function (skills) { return skills.toArray(); });
    };
    SkillsDataHandler.getSkill = function (skillName) {
        return new skill_1.Skill()
            .query({ where: { name: skillName } })
            .fetch();
    };
    SkillsDataHandler.getTeams = function (skillName) {
        var _this = this;
        return this.getSkill(skillName)
            .then(function (skill) { return _this._fetchSkillTeams(skill); });
    };
    SkillsDataHandler.fetchSkillPrerequisitesBySkill = function (skill) {
        if (!skill) {
            return Promise.resolve(new skill_1.Skills());
        }
        return skill.getPrerequisiteSkills().fetch();
    };
    SkillsDataHandler.fetchContributingSkillsBySkill = function (skill) {
        if (!skill) {
            return Promise.resolve(new skill_1.Skills());
        }
        return skill.getContributingSkills().fetch();
    };
    SkillsDataHandler._fetchSkillTeams = function (skill) {
        if (!skill) {
            return Promise.resolve([]);
        }
        return skill.getTeams();
    };
    return SkillsDataHandler;
}());
exports.SkillsDataHandler = SkillsDataHandler;
