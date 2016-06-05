"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var bookshelf_1 = require('../../bookshelf');
var Promise = require('bluebird');
var typesValidator_1 = require('../commonUtils/typesValidator');
var SkillPrerequisite = (function (_super) {
    __extends(SkillPrerequisite, _super);
    function SkillPrerequisite() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(SkillPrerequisite.prototype, "tableName", {
        get: function () { return 'skills_prerequisites'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SkillPrerequisite.prototype, "idAttribute", {
        get: function () { return 'id'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SkillPrerequisite, "skillIdAttribute", {
        get: function () { return 'skill_id'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SkillPrerequisite, "skillPrerequisiteIdAttribute", {
        get: function () { return 'skill_prerequisite_id'; },
        enumerable: true,
        configurable: true
    });
    SkillPrerequisite.prototype.initialize = function () {
        var _this = this;
        this.on('saving', function (skillPrerequisite) { return _this.validateSkillPrerequisite(skillPrerequisite); });
    };
    SkillPrerequisite.prototype.validateSkillPrerequisite = function (skillPrerequisite) {
        if (!typesValidator_1.TypesValidator.isInteger(skillPrerequisite.attributes.skill_id)) {
            return Promise.reject('The skill_id must be an integer');
        }
        if (!typesValidator_1.TypesValidator.isInteger(skillPrerequisite.attributes.skill_prerequisite_id)) {
            return Promise.reject('The skill_prerequisite_id be an integer');
        }
        if (skillPrerequisite.attributes.skill_id === skillPrerequisite.attributes.skill_prerequisite_id) {
            return Promise.reject('Skill can not be a prerequisite of itself');
        }
        return null;
    };
    return SkillPrerequisite;
}(bookshelf_1.bookshelf.Model));
exports.SkillPrerequisite = SkillPrerequisite;
var SkillPrerequisites = (function (_super) {
    __extends(SkillPrerequisites, _super);
    function SkillPrerequisites() {
        _super.apply(this, arguments);
        this.model = SkillPrerequisite;
    }
    SkillPrerequisites.clearAll = function () {
        var promises = [];
        return new SkillPrerequisites().fetch().then(function (users) {
            users.each(function (skillPrerequisite) {
                var promise = skillPrerequisite.destroy(null);
                promises.push(promise);
            });
            return Promise.all(promises);
        });
    };
    return SkillPrerequisites;
}(bookshelf_1.bookshelf.Collection));
exports.SkillPrerequisites = SkillPrerequisites;
