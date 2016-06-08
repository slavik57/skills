"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var skill_1 = require("./skill");
var team_1 = require("./team");
var teamSkillUpvote_1 = require("./teamSkillUpvote");
var bookshelf_1 = require('../../bookshelf');
var Promise = require('bluebird');
var typesValidator_1 = require('../commonUtils/typesValidator');
var TeamSkill = (function (_super) {
    __extends(TeamSkill, _super);
    function TeamSkill() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(TeamSkill.prototype, "tableName", {
        get: function () { return 'team_skills'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamSkill.prototype, "idAttribute", {
        get: function () { return 'id'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamSkill, "skillIdAttribute", {
        get: function () { return 'skill_id'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamSkill, "teamIdAttribute", {
        get: function () { return 'team_id'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamSkill, "relatedTeamSkillUpvotesAttribute", {
        get: function () { return 'upvotes'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamSkill, "relatedTeamAttribute", {
        get: function () { return 'team'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamSkill, "relatedSkillAttribute", {
        get: function () { return 'skill'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamSkill, "dependents", {
        get: function () {
            return [
                TeamSkill.relatedTeamSkillUpvotesAttribute
            ];
        },
        enumerable: true,
        configurable: true
    });
    TeamSkill.collection = function (teamSkills, options) {
        return new TeamSkills(teamSkills, options);
    };
    TeamSkill.prototype.initialize = function () {
        var _this = this;
        this.on('saving', function (teamSkill) { return _this._validateTeamSkill(teamSkill); });
    };
    TeamSkill.prototype.upvotes = function () {
        return this.hasMany(teamSkillUpvote_1.TeamSkillUpvote, teamSkillUpvote_1.TeamSkillUpvote.teamSkillIdAttribute);
    };
    TeamSkill.prototype.team = function () {
        return this.belongsTo(team_1.Team, TeamSkill.teamIdAttribute);
    };
    TeamSkill.prototype.skill = function () {
        return this.belongsTo(skill_1.Skill, TeamSkill.skillIdAttribute);
    };
    TeamSkill.prototype._validateTeamSkill = function (teamSkill) {
        if (!typesValidator_1.TypesValidator.isInteger(teamSkill.attributes.team_id)) {
            return Promise.reject('The team_id must be an integer');
        }
        if (!typesValidator_1.TypesValidator.isInteger(teamSkill.attributes.skill_id)) {
            return Promise.reject('The skill_id be an integer');
        }
        return Promise.resolve(true);
    };
    return TeamSkill;
}(bookshelf_1.bookshelf.Model));
exports.TeamSkill = TeamSkill;
var TeamSkills = (function (_super) {
    __extends(TeamSkills, _super);
    function TeamSkills() {
        _super.apply(this, arguments);
        this.model = TeamSkill;
    }
    TeamSkills.clearAll = function () {
        return new TeamSkills().query().del();
    };
    return TeamSkills;
}(bookshelf_1.bookshelf.Collection));
exports.TeamSkills = TeamSkills;
