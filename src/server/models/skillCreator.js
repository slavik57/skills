"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var typesValidator_1 = require("../../common/typesValidator");
var modelBase_1 = require("./modelBase");
var bookshelf_1 = require('../../../bookshelf');
var bluebirdPromise = require('bluebird');
var SkillCreator = (function (_super) {
    __extends(SkillCreator, _super);
    function SkillCreator() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(SkillCreator.prototype, "tableName", {
        get: function () { return 'skill_creator'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SkillCreator, "skillIdAttribute", {
        get: function () { return 'skill_id'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SkillCreator, "userIdAttribute", {
        get: function () { return 'user_id'; },
        enumerable: true,
        configurable: true
    });
    SkillCreator.collection = function (skillsCreators, options) {
        return new SkillCreators(skillsCreators, options);
    };
    SkillCreator.prototype.initialize = function () {
        var _this = this;
        this.on('saving', function (_skillsCreator) { return _this._validateSkillCreator(_skillsCreator); });
    };
    SkillCreator.prototype._validateSkillCreator = function (skillCreator) {
        if (!typesValidator_1.TypesValidator.isInteger(skillCreator.attributes.skill_id)) {
            return bluebirdPromise.reject(this._createError('The skill_id must be an integer'));
        }
        if (!typesValidator_1.TypesValidator.isInteger(skillCreator.attributes.user_id)) {
            return bluebirdPromise.reject(this._createError('The user_id be an integer'));
        }
        return bluebirdPromise.resolve(true);
    };
    SkillCreator.prototype._createError = function (errorMessage) {
        var error = new Error();
        error.message = errorMessage;
        return error;
    };
    return SkillCreator;
}(modelBase_1.ModelBase));
exports.SkillCreator = SkillCreator;
var SkillCreators = (function (_super) {
    __extends(SkillCreators, _super);
    function SkillCreators() {
        _super.apply(this, arguments);
        this.model = SkillCreator;
    }
    SkillCreators.clearAll = function () {
        return new SkillCreators().query().del();
    };
    return SkillCreators;
}(bookshelf_1.bookshelf.Collection));
exports.SkillCreators = SkillCreators;
//# sourceMappingURL=skillCreator.js.map