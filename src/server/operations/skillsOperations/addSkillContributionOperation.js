"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var alreadyExistsError_1 = require("../../../common/errors/alreadyExistsError");
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var skillOperationBase_1 = require("../base/skillOperationBase");
var bluebirdPromise = require('bluebird');
var _ = require('lodash');
var AddSkillContributionOperation = (function (_super) {
    __extends(AddSkillContributionOperation, _super);
    function AddSkillContributionOperation(_skillId, _skillContributionName, executingUserId) {
        _super.call(this, executingUserId);
        this._skillId = _skillId;
        this._skillContributionName = _skillContributionName;
    }
    AddSkillContributionOperation.prototype.doWork = function () {
        var _this = this;
        var skillPrerequisiteInfo;
        return this.getSkillByName(this._skillContributionName)
            .then(function (_skill) { return _this.verifySkillPrerequisiteNotCircularToItself(_skill, _this._skillId); })
            .then(function (_skill) {
            skillPrerequisiteInfo = {
                skill_id: _skill.id,
                skill_prerequisite_id: _this._skillId
            };
        })
            .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillContributions(_this._skillId); })
            .then(function (_contributions) { return _this._verifyNotAlreadyAContribution(_contributions); })
            .then(function () { return skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo); });
    };
    AddSkillContributionOperation.prototype._verifyNotAlreadyAContribution = function (skills) {
        var _this = this;
        var contribution = _.find(skills, function (_skill) { return _skill.attributes.name === _this._skillContributionName; });
        if (!contribution) {
            return bluebirdPromise.resolve();
        }
        else {
            return bluebirdPromise.reject(new alreadyExistsError_1.AlreadyExistsError());
        }
    };
    return AddSkillContributionOperation;
}(skillOperationBase_1.SkillOperationBase));
exports.AddSkillContributionOperation = AddSkillContributionOperation;
//# sourceMappingURL=addSkillContributionOperation.js.map