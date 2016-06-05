"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
    Object.defineProperty(TeamSkill, "upvotesAttribute", {
        get: function () { return 'upvotes'; },
        enumerable: true,
        configurable: true
    });
    TeamSkill.prototype.initialize = function () {
        var _this = this;
        this.on('saving', function (teamSkill) { return _this._validateTeamSkill(teamSkill); });
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
        var promises = [];
        return new TeamSkills().fetch().then(function (users) {
            users.each(function (teamMembers) {
                var promise = teamMembers.destroy(null);
                promises.push(promise);
            });
            return Promise.all(promises);
        });
    };
    return TeamSkills;
}(bookshelf_1.bookshelf.Collection));
exports.TeamSkills = TeamSkills;
