"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var skillCreator_1 = require("./skillCreator");
var modelBase_1 = require("./modelBase");
var team_1 = require("./team");
var bookshelf_1 = require('../../../bookshelf');
var Promise = require('bluebird');
var _ = require('lodash');
var typesValidator_1 = require('../../common/typesValidator');
var skillPrerequisite_1 = require('./skillPrerequisite');
var teamSkill_1 = require('./teamSkill');
var Skill = (function (_super) {
    __extends(Skill, _super);
    function Skill() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(Skill.prototype, "tableName", {
        get: function () { return 'skills'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Skill, "dependents", {
        get: function () {
            return [
                Skill.relatedSkillPrerequisitesAttribute,
                Skill.relatedSkillContributorsAttribute,
                Skill.relatedTeamSkillsAttribute,
                Skill.relatedSkillCreatorAttribute
            ];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Skill, "nameAttribute", {
        get: function () { return 'name'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Skill, "relatedSkillPrerequisitesAttribute", {
        get: function () { return 'skillPrerequisites'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Skill, "relatedSkillContributorsAttribute", {
        get: function () { return 'skillContributors'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Skill, "relatedTeamSkillsAttribute", {
        get: function () { return 'teamSkills'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Skill, "relatedSkillCreatorAttribute", {
        get: function () { return 'skillCreator'; },
        enumerable: true,
        configurable: true
    });
    Skill.collection = function (skills, options) {
        return new Skills(skills, options);
    };
    Skill.prototype.initialize = function () {
        var _this = this;
        this.on('saving', function (skill) { return _this._validateSkill(skill); });
    };
    Skill.prototype.skillPrerequisites = function () {
        return this.hasMany(skillPrerequisite_1.SkillPrerequisite, skillPrerequisite_1.SkillPrerequisite.skillIdAttribute);
    };
    Skill.prototype.skillContributors = function () {
        return this.hasMany(skillPrerequisite_1.SkillPrerequisite, skillPrerequisite_1.SkillPrerequisite.skillPrerequisiteIdAttribute);
    };
    Skill.prototype.teamSkills = function () {
        return this.hasMany(teamSkill_1.TeamSkill, teamSkill_1.TeamSkill.skillIdAttribute);
    };
    Skill.prototype.skillCreator = function () {
        return this.hasOne(skillCreator_1.SkillCreator, skillCreator_1.SkillCreator.skillIdAttribute);
    };
    Skill.prototype.prerequisiteSkills = function () {
        return this.belongsToMany(Skill)
            .through(skillPrerequisite_1.SkillPrerequisite, skillPrerequisite_1.SkillPrerequisite.skillIdAttribute, skillPrerequisite_1.SkillPrerequisite.skillPrerequisiteIdAttribute);
    };
    Skill.prototype.contributingSkills = function () {
        return this.belongsToMany(Skill)
            .through(skillPrerequisite_1.SkillPrerequisite, skillPrerequisite_1.SkillPrerequisite.skillPrerequisiteIdAttribute, skillPrerequisite_1.SkillPrerequisite.skillIdAttribute);
    };
    Skill.prototype.getTeams = function () {
        var _this = this;
        var fetchOptions = {
            withRelated: [
                teamSkill_1.TeamSkill.relatedTeamSkillUpvotesAttribute,
                teamSkill_1.TeamSkill.relatedTeamAttribute
            ]
        };
        return this.teamSkills()
            .fetch(fetchOptions)
            .then(function (teamSkillsCollection) {
            var teamSkills = teamSkillsCollection.toArray();
            return _.map(teamSkills, function (_skill) { return _this._convertTeamSkillToTeamOfASkill(_skill); });
        });
    };
    Skill.prototype._validateSkill = function (skill) {
        if (!typesValidator_1.TypesValidator.isLongEnoughString(skill.attributes.name, 1)) {
            return Promise.reject('The skill name must not be empty');
        }
        return Promise.resolve(true);
    };
    Skill.prototype._teams = function () {
        return this.belongsToMany(team_1.Team)
            .through(teamSkill_1.TeamSkill, teamSkill_1.TeamSkill.skillIdAttribute, teamSkill_1.TeamSkill.teamIdAttribute);
    };
    Skill.prototype._convertTeamSkillToTeamOfASkill = function (teamSkill) {
        var team = teamSkill.relations.team;
        var upvotesCollection = teamSkill.relations.upvotes;
        var upvotes = upvotesCollection.toArray();
        var upvotingIds = _.map(upvotes, function (_) { return _.attributes.user_id; });
        return {
            team: team,
            upvotingUserIds: upvotingIds
        };
    };
    return Skill;
}(modelBase_1.ModelBase));
exports.Skill = Skill;
var Skills = (function (_super) {
    __extends(Skills, _super);
    function Skills() {
        _super.apply(this, arguments);
        this.model = Skill;
    }
    Skills.clearAll = function () {
        return new Skills().query().del();
    };
    Skills.getTeamsOfSkills = function () {
        var _this = this;
        var fetchOptions = {
            withRelated: [
                Skill.relatedTeamSkillsAttribute
            ]
        };
        return new Skills()
            .fetch(fetchOptions)
            .then(function (_skillsCollection) {
            return _skillsCollection.toArray();
        })
            .then(function (_skills) {
            return _.map(_skills, function (_skill) { return _this._convertToTeamsOfASkill(_skill); });
        });
    };
    Skills.getSkillsToPrerequisitesMap = function () {
        var _this = this;
        var fetchOptions = {
            withRelated: [
                Skill.relatedSkillPrerequisitesAttribute
            ]
        };
        return new Skills()
            .fetch(fetchOptions)
            .then(function (_skillsCollection) {
            return _skillsCollection.toArray();
        })
            .then(function (_skills) {
            return _.map(_skills, function (_skill) { return _this._convertToPrerequisitesOfASkill(_skill); });
        });
    };
    Skills._convertToTeamsOfASkill = function (skill) {
        var teamSkills = skill.relations.teamSkills.toArray();
        return {
            skill: skill,
            teamsIds: _.map(teamSkills, function (_) { return _.attributes.team_id; })
        };
    };
    Skills._convertToPrerequisitesOfASkill = function (skill) {
        var skillPrerequisites = skill.relations.skillPrerequisites.toArray();
        return {
            skill: skill,
            prerequisiteSkillIds: _.map(skillPrerequisites, function (_) { return _.attributes.skill_prerequisite_id; })
        };
    };
    return Skills;
}(bookshelf_1.bookshelf.Collection));
exports.Skills = Skills;
//# sourceMappingURL=skill.js.map