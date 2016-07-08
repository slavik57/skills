"use strict";
var teamCreator_1 = require("../models/teamCreator");
var skillCreator_1 = require("../models/skillCreator");
var teamSkillUpvote_1 = require("../models/teamSkillUpvote");
var teamSkill_1 = require("../models/teamSkill");
var skillPrerequisite_1 = require("../models/skillPrerequisite");
var skill_1 = require("../models/skill");
var team_1 = require("../models/team");
var user_1 = require("../models/user");
var teamMember_1 = require("../models/teamMember");
var usersGlobalPermissions_1 = require("../models/usersGlobalPermissions");
var bluebirdPromise = require('bluebird');
var EnvironmentCleaner = (function () {
    function EnvironmentCleaner() {
    }
    EnvironmentCleaner.clearTables = function () {
        var _this = this;
        return this._clearLevel3Tables()
            .then(function () { return _this._clearLevel2Tables(); })
            .then(function () { return _this._clearLevel1Tables(); })
            .then(function () { return _this._clearLevel0Tables(); });
    };
    EnvironmentCleaner._clearLevel3Tables = function () {
        return teamSkillUpvote_1.TeamSkillUpvotes.clearAll();
    };
    EnvironmentCleaner._clearLevel2Tables = function () {
        return bluebirdPromise.all([
            skillPrerequisite_1.SkillPrerequisites.clearAll(),
            teamSkill_1.TeamSkills.clearAll(),
            skillCreator_1.SkillCreators.clearAll(),
            teamCreator_1.TeamCreators.clearAll()
        ]);
    };
    EnvironmentCleaner._clearLevel1Tables = function () {
        return bluebirdPromise.all([
            usersGlobalPermissions_1.UsersGlobalPermissions.clearAll(),
            teamMember_1.TeamMembers.clearAll(),
            skill_1.Skills.clearAll()
        ]);
    };
    EnvironmentCleaner._clearLevel0Tables = function () {
        return bluebirdPromise.all([
            user_1.Users.clearAll(),
            team_1.Teams.clearAll()
        ]);
    };
    return EnvironmentCleaner;
}());
exports.EnvironmentCleaner = EnvironmentCleaner;
//# sourceMappingURL=environmentCleaner.js.map