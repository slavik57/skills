"use strict";
var teamSkillUpvote_1 = require("../models/teamSkillUpvote");
var teamSkill_1 = require("../models/teamSkill");
var skillPrerequisite_1 = require("../models/skillPrerequisite");
var skill_1 = require("../models/skill");
var team_1 = require("../models/team");
var user_1 = require("../models/user");
var teamMember_1 = require("../models/teamMember");
var usersGlobalPermissions_1 = require("../models/usersGlobalPermissions");
var EnvironmentCleaner = (function () {
    function EnvironmentCleaner() {
    }
    EnvironmentCleaner.clearTables = function () {
        var _this = this;
        return this._clearLevel2Tables()
            .then(function () { return _this._clearLevel1Tables(); })
            .then(function () { return _this._clearLevel0Tables(); });
    };
    EnvironmentCleaner._clearLevel2Tables = function () {
        return teamSkillUpvote_1.TeamSkillUpvotes.clearAll();
    };
    EnvironmentCleaner._clearLevel1Tables = function () {
        return Promise.all([
            usersGlobalPermissions_1.UsersGlobalPermissions.clearAll(),
            teamMember_1.TeamMembers.clearAll(),
            skillPrerequisite_1.SkillPrerequisites.clearAll(),
            teamSkill_1.TeamSkills.clearAll()
        ]);
    };
    EnvironmentCleaner._clearLevel0Tables = function () {
        return Promise.all([
            user_1.Users.clearAll(),
            team_1.Teams.clearAll(),
            skill_1.Skills.clearAll()
        ]);
    };
    return EnvironmentCleaner;
}());
exports.EnvironmentCleaner = EnvironmentCleaner;
//# sourceMappingURL=environmentCleaner.js.map