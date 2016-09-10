"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var skillSelfPrerequisiteError_1 = require("../../../common/errors/skillSelfPrerequisiteError");
var notFoundError_1 = require("../../../common/errors/notFoundError");
var skillsDataHandler_1 = require("../../dataHandlers/skillsDataHandler");
var globalPermission_1 = require("../../models/enums/globalPermission");
var authenticatedOperationBase_1 = require("./authenticatedOperationBase");
var bluebirdPromise = require('bluebird');
var SkillOperationBase = (function (_super) {
    __extends(SkillOperationBase, _super);
    function SkillOperationBase(executingUserId) {
        _super.call(this, executingUserId);
    }
    Object.defineProperty(SkillOperationBase.prototype, "sufficientOperationGlobalPermissions", {
        get: function () {
            return [globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN];
        },
        enumerable: true,
        configurable: true
    });
    SkillOperationBase.prototype.getSkillByName = function (skillName) {
        return skillsDataHandler_1.SkillsDataHandler.getSkillByName(skillName)
            .then(function (_skill) {
            if (!_skill) {
                var error = new notFoundError_1.NotFoundError();
                error.message = "Skill with name: [" + skillName + "] not found";
                return bluebirdPromise.reject(error);
            }
            return _skill;
        });
    };
    SkillOperationBase.prototype.verifySkillPrerequisiteNotCircularToItself = function (skillPrerequisite, skillId) {
        if (skillPrerequisite.id === skillId) {
            throw new skillSelfPrerequisiteError_1.SkillSelfPrerequisiteError();
        }
        return skillPrerequisite;
    };
    return SkillOperationBase;
}(authenticatedOperationBase_1.AuthenticatedOperationBase));
exports.SkillOperationBase = SkillOperationBase;
//# sourceMappingURL=skillOperationBase.js.map