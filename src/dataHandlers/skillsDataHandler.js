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
    SkillsDataHandler.getSkillPrerequisites = function (skillId) {
        var skill = this._initializeSkillByIdQuery(skillId);
        return this._fetchSkillPrerequisitesBySkill(skill)
            .then(function (skills) { return skills.toArray(); });
    };
    SkillsDataHandler.getSkillContributions = function (skillId) {
        var skill = this._initializeSkillByIdQuery(skillId);
        return this._fetchContributingSkillsBySkill(skill)
            .then(function (skills) { return skills.toArray(); });
    };
    SkillsDataHandler.getSkill = function (skillId) {
        var fetchOptions = {
            require: false
        };
        return this._initializeSkillByIdQuery(skillId)
            .fetch(fetchOptions);
    };
    SkillsDataHandler.getTeams = function (skillId) {
        var skill = this._initializeSkillByIdQuery(skillId);
        return this._fetchSkillTeams(skill);
    };
    SkillsDataHandler._initializeSkillByIdQuery = function (skillId) {
        var queryCondition = {};
        queryCondition[skill_1.Skill.idAttribute] = skillId;
        return new skill_1.Skill(queryCondition);
    };
    SkillsDataHandler._fetchSkillPrerequisitesBySkill = function (skill) {
        var fetchOptions = {
            require: false
        };
        return skill.prerequisiteSkills().fetch(fetchOptions);
    };
    SkillsDataHandler._fetchContributingSkillsBySkill = function (skill) {
        var fetchOptions = {
            require: false
        };
        return skill.contributingSkills().fetch(fetchOptions);
    };
    SkillsDataHandler._fetchSkillTeams = function (skill) {
        return skill.getTeams();
    };
    return SkillsDataHandler;
}());
exports.SkillsDataHandler = SkillsDataHandler;
