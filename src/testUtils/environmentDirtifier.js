"use strict";
var globalPermission_1 = require("../models/enums/globalPermission");
var skillsDataHandler_1 = require("../dataHandlers/skillsDataHandler");
var teamsDataHandler_1 = require("../dataHandlers/teamsDataHandler");
var userDataHandler_1 = require("../dataHandlers/userDataHandler");
var modelInfoMockFactory_1 = require("./modelInfoMockFactory");
var _ = require('lodash');
var EnvironmentDirtifier = (function () {
    function EnvironmentDirtifier() {
    }
    Object.defineProperty(EnvironmentDirtifier, "numberOfUsers", {
        get: function () { return 5; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EnvironmentDirtifier, "numberOfTeams", {
        get: function () { return 5; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EnvironmentDirtifier, "numberOfSkills", {
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
            .then(function () { return testModels; });
    };
    EnvironmentDirtifier.createUsers = function (numberOfUsers) {
        var userCreationPromises = [];
        for (var i = 0; i < numberOfUsers; i++) {
            var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(i);
            userCreationPromises.push(userDataHandler_1.UserDataHandler.createUser(userInfo));
        }
        return Promise.all(userCreationPromises);
    };
    EnvironmentDirtifier.createSkills = function (numberOfSkills) {
        var skillCreationPromises = [];
        for (var i = 0; i < numberOfSkills; i++) {
            var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo(i.toString());
            skillCreationPromises.push(skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo));
        }
        return Promise.all(skillCreationPromises);
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
        return Promise.all(skillPrerequisitesCreationPromises);
    };
    EnvironmentDirtifier.createTeams = function (numberOfTeams) {
        var teamCreationPromises = [];
        for (var i = 0; i < numberOfTeams; i++) {
            var teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo(i.toString());
            teamCreationPromises.push(teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo));
        }
        return Promise.all(teamCreationPromises);
    };
    EnvironmentDirtifier._fillLevel0Tables = function (testModels) {
        return Promise.all([
            this._fillUsers(testModels),
            this._fillTeams(testModels),
            this._fillSkills(testModels)
        ]);
    };
    EnvironmentDirtifier._fillLevel1Tables = function (testModels) {
        return Promise.all([
            this._fillUsersGlobalPermissions(testModels),
            this._fillTeamMembers(testModels),
            this._fillSkillPrerequisites(testModels),
            this._fillTeamSkills(testModels)
        ]);
    };
    EnvironmentDirtifier._fillLevel2Tables = function (testModels) {
        return this._fillTeamSkillUpvotes(testModels);
    };
    EnvironmentDirtifier._fillUsers = function (testModels) {
        return this.createUsers(this.numberOfUsers)
            .then(function (users) {
            testModels.users = users;
        });
    };
    EnvironmentDirtifier._fillTeams = function (testModels) {
        return this.createTeams(this.numberOfTeams)
            .then(function (teams) {
            testModels.teams = teams;
        });
    };
    EnvironmentDirtifier._fillSkills = function (testModels) {
        return this.createSkills(this.numberOfSkills)
            .then(function (skills) {
            testModels.skills = skills;
        });
    };
    EnvironmentDirtifier._fillUsersGlobalPermissions = function (testModels) {
        var _this = this;
        var permissionsCreationPromises = [];
        testModels.users.forEach(function (_user) {
            var permissionsPromise = userDataHandler_1.UserDataHandler.addGlobalPermissions(_user.id, _this.permissionsForEachUser);
            permissionsCreationPromises.push(permissionsPromise);
        });
        return Promise.all(permissionsCreationPromises)
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
        return Promise.all(teamMembersCreationPromises)
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
        return Promise.all(teamSkillsCreationPromises)
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
        return Promise.all(teamSkillUpvotesCreationPromises)
            .then(function (teamSkillUpvotes) {
            testModels.teamSkillUpvotes = teamSkillUpvotes;
        });
    };
    return EnvironmentDirtifier;
}());
exports.EnvironmentDirtifier = EnvironmentDirtifier;
