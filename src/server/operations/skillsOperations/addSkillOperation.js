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
var AddSkillOperation = (function (_super) {
    __extends(AddSkillOperation, _super);
    function AddSkillOperation(executingUserId, _skillInfo) {
        _super.call(this, executingUserId);
        this._skillInfo = _skillInfo;
    }
    AddSkillOperation.prototype.canExecute = function () {
        var _this = this;
        return _super.prototype.canExecute.call(this)
            .then(function () { return _this._checkIfSkillAlreadyExists(); }, function (_error) { return bluebirdPromise.reject(_error); });
    };
    AddSkillOperation.prototype.doWork = function () {
        return skillsDataHandler_1.SkillsDataHandler.createSkill(this._skillInfo, this.executingUserId);
    };
    AddSkillOperation.prototype._checkIfSkillAlreadyExists = function () {
        var _this = this;
        return skillsDataHandler_1.SkillsDataHandler.getSkillByName(this._skillInfo.name)
            .then(function (_skill) {
            if (!_skill) {
                return bluebirdPromise.resolve();
            }
            var error = new alreadyExistsError_1.AlreadyExistsError();
            error.message = 'Skill with the name ' + _this._skillInfo.name + ' already exists';
            return bluebirdPromise.reject(error);
        }, function () {
            return bluebirdPromise.resolve();
        });
    };
    return AddSkillOperation;
}(skillOperationBase_1.SkillOperationBase));
exports.AddSkillOperation = AddSkillOperation;
//# sourceMappingURL=addSkillOperation.js.map