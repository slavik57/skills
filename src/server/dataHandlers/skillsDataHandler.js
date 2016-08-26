"use strict";
var skillCreator_1 = require("../models/skillCreator");
var skillCreator_2 = require("../models/skillCreator");
var skill_1 = require('../models/skill');
var skillPrerequisite_1 = require('../models/skillPrerequisite');
var bookshelf_1 = require('../../../bookshelf');
var SkillsDataHandler = (function () {
    function SkillsDataHandler() {
    }
    SkillsDataHandler.createSkill = function (skillInfo, creatorId) {
        return bookshelf_1.bookshelf.transaction(function (_transaction) {
            var saveOptions = {
                transacting: _transaction
            };
            var skill;
            var skillCreatorInfo;
            return new skill_1.Skill(skillInfo).save(null, saveOptions)
                .then(function (_skill) {
                skill = _skill;
                skillCreatorInfo = {
                    user_id: creatorId,
                    skill_id: skill.id
                };
            })
                .then(function () { return new skillCreator_2.SkillCreator(skillCreatorInfo).save(null, saveOptions); })
                .then(function () {
                return skill;
            });
        });
    };
    SkillsDataHandler.deleteSkill = function (skillId) {
        return this._initializeSkillByIdQuery(skillId).destroy();
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
    SkillsDataHandler.removeSkillPrerequisite = function (skillId, skillPrerequisiteId) {
        var query = {};
        query[skillPrerequisite_1.SkillPrerequisite.skillIdAttribute] = skillId;
        query[skillPrerequisite_1.SkillPrerequisite.skillPrerequisiteIdAttribute] = skillPrerequisiteId;
        var destroyOptions = {
            cascadeDelete: false
        };
        return new skillPrerequisite_1.SkillPrerequisite().where(query).destroy(destroyOptions);
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
    SkillsDataHandler.getSkillsToPrerequisitesMap = function () {
        return skill_1.Skills.getSkillsToPrerequisitesMap();
    };
    SkillsDataHandler.getSkill = function (skillId) {
        var fetchOptions = {
            require: false
        };
        return this._initializeSkillByIdQuery(skillId)
            .fetch(fetchOptions);
    };
    SkillsDataHandler.getSkillByName = function (name) {
        var skill = this._initializeSkillByNameQuery(name);
        return skill.fetch();
    };
    SkillsDataHandler.getTeams = function (skillId) {
        var skill = this._initializeSkillByIdQuery(skillId);
        return this._fetchSkillTeams(skill);
    };
    SkillsDataHandler.getTeamsOfSkills = function () {
        return skill_1.Skills.getTeamsOfSkills();
    };
    SkillsDataHandler.getSkillsCreators = function () {
        return new skillCreator_1.SkillCreators().fetch()
            .then(function (_skillsCreatorsCollection) {
            return _skillsCreatorsCollection.toArray();
        });
    };
    SkillsDataHandler._initializeSkillByIdQuery = function (skillId) {
        var queryCondition = {};
        queryCondition[skill_1.Skill.idAttribute] = skillId;
        return new skill_1.Skill(queryCondition);
    };
    SkillsDataHandler._initializeSkillByNameQuery = function (name) {
        var queryCondition = {};
        queryCondition[skill_1.Skill.nameAttribute] = name;
        return new skill_1.Skill(queryCondition);
    };
    SkillsDataHandler._initializeSkillPrerequisiteByIdQuery = function (skillPrerequisiteId) {
        var queryCondition = {};
        queryCondition[skillPrerequisite_1.SkillPrerequisite.idAttribute] = skillPrerequisiteId;
        return new skillPrerequisite_1.SkillPrerequisite(queryCondition);
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
//# sourceMappingURL=skillsDataHandler.js.map