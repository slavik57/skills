"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var team_1 = require("./team");
var bookshelf_1 = require('../../bookshelf');
var Promise = require('bluebird');
var _ = require('lodash');
var typesValidator_1 = require('../commonUtils/typesValidator');
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
    Object.defineProperty(Skill.prototype, "idAttribute", {
        get: function () { return 'id'; },
        enumerable: true,
        configurable: true
    });
    Skill.prototype.initialize = function () {
        var _this = this;
        this.on('saving', function (skill) { return _this.validateSkill(skill); });
    };
    Skill.prototype.validateSkill = function (skill) {
        if (!typesValidator_1.TypesValidator.isLongEnoughString(skill.attributes.name, 1)) {
            return Promise.reject('The skill name must not be empty');
        }
        return null;
    };
    Skill.prototype.getPrerequisiteSkills = function () {
        return this.belongsToMany(Skill).through(skillPrerequisite_1.SkillPrerequisite, 'skill_id', 'skill_prerequisite_id');
    };
    Skill.prototype.getContributingSkills = function () {
        return this.belongsToMany(Skill).through(skillPrerequisite_1.SkillPrerequisite, 'skill_prerequisite_id', 'skill_id');
    };
    Skill.prototype.getTeams = function () {
        var _this = this;
        return this.belongsToMany(team_1.Team)
            .withPivot(['upvotes'])
            .through(teamSkill_1.TeamSkill, 'skill_id', 'team_id')
            .fetch()
            .then(function (teamsCollection) {
            var teams = teamsCollection.toArray();
            return _.map(teams, function (_team) { return _this._convertTeamToTeamOfASkill(_team); });
        });
    };
    Skill.prototype._convertTeamToTeamOfASkill = function (team) {
        var teamSkill = team.pivot;
        var upvotes = teamSkill.attributes.upvotes;
        return {
            team: team,
            upvotes: upvotes
        };
    };
    return Skill;
}(bookshelf_1.bookshelf.Model));
exports.Skill = Skill;
var Skills = (function (_super) {
    __extends(Skills, _super);
    function Skills() {
        _super.apply(this, arguments);
        this.model = Skill;
    }
    Skills.clearAll = function () {
        var promises = [];
        return new Skills().fetch().then(function (skills) {
            skills.each(function (skill) {
                var promise = skill.destroy(null);
                promises.push(promise);
            });
            return Promise.all(promises);
        });
    };
    return Skills;
}(bookshelf_1.bookshelf.Collection));
exports.Skills = Skills;
