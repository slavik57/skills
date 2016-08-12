"use strict";
var globalPermission_1 = require("../models/enums/globalPermission");
var skillsDataHandler_1 = require("../dataHandlers/skillsDataHandler");
var teamsDataHandler_1 = require("../dataHandlers/teamsDataHandler");
var userDataHandler_1 = require("../dataHandlers/userDataHandler");
var modelInfoMockFactory_1 = require("./modelInfoMockFactory");
var _ = require('lodash');
var bluebirdPromise = require('bluebird');
var EnvironmentDirtifier = (function () {
    function EnvironmentDirtifier() {
    }
    Object.defineProperty(EnvironmentDirtifier, "numberOfUsers", {
        get: function () { return 5; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EnvironmentDirtifier, "permissionsForEachUser", {
        get: function () {
            return [
                globalPermission_1.GlobalPermission.ADMIN,
                globalPermission_1.GlobalPermission.TEAMS_LIST_ADMIN,
                globalPermission_1.GlobalPermission.SKILLS_LIST_ADMIN,
                globalPermission_1.GlobalPermission.READER
            ];
        },
        enumerable: true,
        configurable: true
    });
    EnvironmentDirtifier.fillAllTables = function () {
        var _this = this;
        var testModels = {
            users: [],
            skills: [],
            teams: [],
            skillPrerequisites: [],
            userGlobalPermissions: [],
            teamMembers: [],
            teamSkills: [],
            teamSkillUpvotes: []
        };
        return this._fillLevel0Tables(testModels)
            .then(function () { return _this._fillLevel1Tables(testModels); })
            .then(function () { return _this._fillLevel2Tables(testModels); })
            .then(function () { return _this._fillLevel3Tables(testModels); })
            .then(function () { return testModels; });
    };
    EnvironmentDirtifier.createUsers = function (numberOfUsers, suffix) {
        if (suffix === void 0) { suffix = ''; }
        var userCreationPromises = [];
        for (var i = 0; i < numberOfUsers; i++) {
            var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(i, suffix);
            userCreationPromises.push(userDataHandler_1.UserDataHandler.createUser(userInfo));
        }
        return bluebirdPromise.all(userCreationPromises);
    };
    EnvironmentDirtifier.createSkills = function (numberOfSkills, creatorId) {
        var skillCreationPromises = [];
        for (var i = 0; i < numberOfSkills; i++) {
            var skillName = i.toString() + ' created by ' + creatorId.toString();
            var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo(skillName);
            skillCreationPromises.push(skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo, creatorId));
        }
        return bluebirdPromise.all(skillCreationPromises);
    };
    EnvironmentDirtifier.createSkillPrerequisites = function (skills) {
        var skillPrerequisitesCreationPromises = [];
        skills.forEach(function (_skill1) {
            skills.forEach(function (_skill2) {
                if (_skill1.id === _skill2.id) {
                    return;
                }
                var skillPrerequisiteInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillPrerequisiteInfo(_skill2, _skill1);
                skillPrerequisitesCreationPromises.push(skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo));
            });
        });
        return bluebirdPromise.all(skillPrerequisitesCreationPromises);
    };
    EnvironmentDirtifier.createTeams = function (numberOfTeams, creatorId) {
        var teamCreationPromises = [];
        for (var i = 0; i < numberOfTeams; i++) {
            var teamName = i.toString() + ' created by ' + creatorId.toString();
            var teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo(teamName);
            teamCreationPromises.push(teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo, creatorId));
        }
        return bluebirdPromise.all(teamCreationPromises);
    };
    EnvironmentDirtifier._fillLevel0Tables = function (testModels) {
        return bluebirdPromise.all([
            this._fillUsers(testModels)
        ]);
    };
    EnvironmentDirtifier._fillLevel1Tables = function (testModels) {
        return bluebirdPromise.all([
            this._fillSkills(testModels),
            this._fillTeams(testModels),
            this._fillUsersGlobalPermissions(testModels),
        ]);
    };
    EnvironmentDirtifier._fillLevel2Tables = function (testModels) {
        return bluebirdPromise.all([
            this._fillTeamMembers(testModels),
            this._fillSkillPrerequisites(testModels),
            this._fillTeamSkills(testModels)
        ]);
    };
    EnvironmentDirtifier._fillLevel3Tables = function (testModels) {
        return this._fillTeamSkillUpvotes(testModels);
    };
    EnvironmentDirtifier._fillUsers = function (testModels) {
        return this.createUsers(this.numberOfUsers)
            .then(function (users) {
            testModels.users = users;
        });
    };
    EnvironmentDirtifier._fillTeams = function (testModels) {
        var _this = this;
        var teamsPromises = [];
        testModels.users.forEach(function (_user) {
            var teamsPromise = _this.createTeams(1, _user.id);
            teamsPromises.push(teamsPromise);
        });
        return bluebirdPromise.all(teamsPromises)
            .then(function (_teams) {
            testModels.teams = _.flatten(_teams);
        });
    };
    EnvironmentDirtifier._fillSkills = function (testModels) {
        var _this = this;
        var skillsPromises = [];
        testModels.users.forEach(function (_user) {
            var skillsPromise = _this.createSkills(1, _user.id);
            skillsPromises.push(skillsPromise);
        });
        return bluebirdPromise.all(skillsPromises)
            .then(function (_skills) {
            testModels.skills = _.flatten(_skills);
        });
    };
    EnvironmentDirtifier._fillUsersGlobalPermissions = function (testModels) {
        var _this = this;
        var permissionsCreationPromises = [];
        testModels.users.forEach(function (_user) {
            var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(_user.id, _this.permissionsForEachUser);
            permissionsCreationPromises.push(permissionsPromise);
        });
        return bluebirdPromise.all(permissionsCreationPromises)
            .then(function (permissions) {
            testModels.userGlobalPermissions = _.flatten(permissions);
        });
    };
    EnvironmentDirtifier._fillTeamMembers = function (testModels) {
        var teamMembersCreationPromises = [];
        testModels.users.forEach(function (_user) {
            testModels.teams.forEach(function (_team) {
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(_team, _user);
                teamMembersCreationPromises.push(teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo));
            });
        });
        return bluebirdPromise.all(teamMembersCreationPromises)
            .then(function (teamMembers) {
            testModels.teamMembers = teamMembers;
        });
    };
    EnvironmentDirtifier._fillSkillPrerequisites = function (testModels) {
        return this.createSkillPrerequisites(testModels.skills)
            .then(function (skillPrerequisites) {
            testModels.skillPrerequisites = skillPrerequisites;
        });
    };
    EnvironmentDirtifier._fillTeamSkills = function (testModels) {
        var teamSkillsCreationPromises = [];
        testModels.teams.forEach(function (_team) {
            testModels.skills.forEach(function (_skill) {
                var teamSkillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(_team, _skill);
                teamSkillsCreationPromises.push(teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo));
            });
        });
        return bluebirdPromise.all(teamSkillsCreationPromises)
            .then(function (teamSkills) {
            testModels.teamSkills = teamSkills;
        });
    };
    EnvironmentDirtifier._fillTeamSkillUpvotes = function (testModels) {
        var teamSkillUpvotesCreationPromises = [];
        testModels.teamSkills.forEach(function (_teamSkill) {
            testModels.users.forEach(function (_user) {
                teamSkillUpvotesCreationPromises.push(teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(_teamSkill.id, _user.id));
            });
        });
        return bluebirdPromise.all(teamSkillUpvotesCreationPromises)
            .then(function (teamSkillUpvotes) {
            testModels.teamSkillUpvotes = teamSkillUpvotes;
        });
    };
    return EnvironmentDirtifier;
}());
exports.EnvironmentDirtifier = EnvironmentDirtifier;
//# sourceMappingURL=environmentDirtifier.js.map