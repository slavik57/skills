"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var modelBase_1 = require("./modelBase");
var bookshelf_1 = require('../../../bookshelf');
var typesValidator_1 = require('../../common/typesValidator');
var bluebirdPromise = require('bluebird');
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
    SkillPrerequisite.collection = function (prerequisites, options) {
        return new SkillPrerequisites(prerequisites, options);
    };
    SkillPrerequisite.prototype.initialize = function () {
        var _this = this;
        this.on('saving', function (skillPrerequisite) { return _this.validateSkillPrerequisite(skillPrerequisite); });
    };
    SkillPrerequisite.prototype.validateSkillPrerequisite = function (skillPrerequisite) {
        if (!typesValidator_1.TypesValidator.isInteger(skillPrerequisite.attributes.skill_id)) {
            return bluebirdPromise.reject(this._createError('The skill_id must be an integer'));
        }
        if (!typesValidator_1.TypesValidator.isInteger(skillPrerequisite.attributes.skill_prerequisite_id)) {
            return bluebirdPromise.reject(this._createError('The skill_prerequisite_id be an integer'));
        }
        if (skillPrerequisite.attributes.skill_id === skillPrerequisite.attributes.skill_prerequisite_id) {
            return bluebirdPromise.reject(this._createError('Skill can not be a prerequisite of itself'));
        }
        return bluebirdPromise.resolve(true);
    };
    SkillPrerequisite.prototype._createError = function (errorMessage) {
        var error = new Error();
        error.message = errorMessage;
        return error;
    };
    return SkillPrerequisite;
}(modelBase_1.ModelBase));
exports.SkillPrerequisite = SkillPrerequisite;
var SkillPrerequisites = (function (_super) {
    __extends(SkillPrerequisites, _super);
    function SkillPrerequisites() {
        _super.apply(this, arguments);
        this.model = SkillPrerequisite;
    }
    SkillPrerequisites.clearAll = function () {
        return new SkillPrerequisites().query().del();
    };
    return SkillPrerequisites;
}(bookshelf_1.bookshelf.Collection));
exports.SkillPrerequisites = SkillPrerequisites;
//# sourceMappingURL=skillPrerequisite.js.map