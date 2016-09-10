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
var AddSkillPrerequisiteOperation = (function (_super) {
    __extends(AddSkillPrerequisiteOperation, _super);
    function AddSkillPrerequisiteOperation(_skillId, _skillPrerequisiteName, executingUserId) {
        _super.call(this, executingUserId);
        this._skillId = _skillId;
        this._skillPrerequisiteName = _skillPrerequisiteName;
    }
    AddSkillPrerequisiteOperation.prototype.doWork = function () {
        var _this = this;
        var skillPrerequisiteInfo;
        return this.getSkillByName(this._skillPrerequisiteName)
            .then(function (_skill) { return _this.verifySkillPrerequisiteNotCircularToItself(_skill, _this._skillId); })
            .then(function (_skill) {
            skillPrerequisiteInfo = {
                skill_id: _this._skillId,
                skill_prerequisite_id: _skill.id
            };
        })
            .then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites(_this._skillId); })
            .then(function (_prerequisites) { return _this._verifyNotAlreadyAPrerequisite(_prerequisites); })
            .then(function () { return skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo); });
    };
    AddSkillPrerequisiteOperation.prototype._verifyNotAlreadyAPrerequisite = function (skills) {
        var _this = this;
        var prerequisite = _.find(skills, function (_skill) { return _skill.attributes.name === _this._skillPrerequisiteName; });
        if (!prerequisite) {
            return bluebirdPromise.resolve();
        }
        else {
            return bluebirdPromise.reject(new alreadyExistsError_1.AlreadyExistsError());
        }
    };
    return AddSkillPrerequisiteOperation;
}(skillOperationBase_1.SkillOperationBase));
exports.AddSkillPrerequisiteOperation = AddSkillPrerequisiteOperation;
//# sourceMappingURL=addSkillPrerequisiteOperation.js.map