"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var globalPermission_1 = require("../../models/enums/globalPermission");
var authenticatedOperationBase_1 = require("./authenticatedOperationBase");
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
    return SkillOperationBase;
}(authenticatedOperationBase_1.AuthenticatedOperationBase));
exports.SkillOperationBase = SkillOperationBase;
//# sourceMappingURL=skillOperationBase.js.map