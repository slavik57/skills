"use strict";
var teamSkillUpvote_1 = require("../models/teamSkillUpvote");
var teamSkill_1 = require("../models/teamSkill");
var teamsDataHandler_1 = require("./teamsDataHandler");
var team_1 = require("../models/team");
var chai = require('chai');
var chai_1 = require('chai');
var _ = require('lodash');
var chaiAsPromised = require('chai-as-promised');
var skill_1 = require('../models/skill');
var skillPrerequisite_1 = require('../models/skillPrerequisite');
var skillsDataHandler_1 = require('./skillsDataHandler');
var userDataHandler_1 = require('./userDataHandler');
var user_1 = require('../models/user');
chai.use(chaiAsPromised);
describe('SkillsDataHandler', function () {
    function clearTables() {
        return teamSkillUpvote_1.TeamSkillUpvotes.clearAll()
            .then(function () { return Promise.all([
            skillPrerequisite_1.SkillPrerequisites.clearAll(),
            teamSkill_1.TeamSkills.clearAll()
        ]); }).then(function () { return Promise.all([
            skill_1.Skills.clearAll(),
            team_1.Teams.clearAll(),
            user_1.Users.clearAll()
        ]); });
    }
    beforeEach(function () {
        return clearTables();
    });
    afterEach(function () {
        return clearTables();
    });
    function createSkillInfo(skillNumber) {
        var skillNumberString = skillNumber.toString();
        return {
            name: 'name ' + skillNumberString
        };
    }
    function verifySkillInfoAsync(actualSkillPromise, expectedSkillInfo) {
        return chai_1.expect(actualSkillPromise).to.eventually.fulfilled
            .then(function (skill) {
            verifySkillInfo(skill.attributes, expectedSkillInfo);
        });
    }
    function verifySkillInfo(actual, expected) {
        var actualCloned = _.clone(actual);
        var expectedCloned = _.clone(expected);
        delete actualCloned['id'];
        delete expectedCloned['id'];
        chai_1.expect(actualCloned).to.be.deep.equal(expectedCloned);
    }
    function createSkillPrerequisiteInfo(skill, skillPrerequisite) {
        return {
            skill_id: skill.id,
            skill_prerequisite_id: skillPrerequisite.id
        };
    }
    function verifySkillPrerequisiteInfoAsync(actualSkillPrerequisitePromise, expectedSkillPrerequisiteInfo) {
        return chai_1.expect(actualSkillPrerequisitePromise).to.eventually.fulfilled
            .then(function (skillPrerequisite) {
            verifySkillPrerequisiteInfo(skillPrerequisite.attributes, expectedSkillPrerequisiteInfo);
        });
    }
    function verifySkillPrerequisiteInfo(actual, expected) {
        var actualCloned = _.clone(actual);
        var expectedCloned = _.clone(expected);
        delete actualCloned['id'];
        delete expectedCloned['id'];
        chai_1.expect(actualCloned).to.be.deep.equal(expectedCloned);
    }
    function verifySkillPrerequisitesInfoWithoutOrderAsync(actualSkillPrerequisitesPromise, expectedSkillPrerequisitesInfo) {
        return chai_1.expect(actualSkillPrerequisitesPromise).to.eventually.fulfilled
            .then(function (skillPrerequisites) {
            var actualSkillPrerequisitesInfos = _.map(skillPrerequisites, function (_) { return _.attributes; });
            verifyPrerequisitesInfoWithoutOrder(actualSkillPrerequisitesInfos, expectedSkillPrerequisitesInfo);
        });
    }
    function verifyPrerequisitesInfoWithoutOrder(actual, expected) {
        var actualOrdered = _.orderBy(actual, function (_) { return _.skill_id; });
        var expectedOrdered = _.orderBy(expected, function (_) { return _.skill_id; });
        chai_1.expect(actualOrdered.length).to.be.equal(expectedOrdered.length);
        for (var i = 0; i < expected.length; i++) {
            verifySkillPrerequisiteInfo(actualOrdered[i], expectedOrdered[i]);
        }
    }
    function verifySkillsInfoWithoutOrderAsync(actualSkillsPromise, expectedSkillsInfo) {
        return chai_1.expect(actualSkillsPromise).to.eventually.fulfilled
            .then(function (skills) {
            var actualSkillInfos = _.map(skills, function (_) { return _.attributes; });
            verifySkillsInfoWithoutOrder(actualSkillInfos, expectedSkillsInfo);
        });
    }
    function verifySkillsInfoWithoutOrder(actual, expected) {
        var actualOrdered = _.orderBy(actual, function (_) { return _.name; });
        var expectedOrdered = _.orderBy(expected, function (_) { return _.name; });
        chai_1.expect(actualOrdered.length).to.be.equal(expectedOrdered.length);
        for (var i = 0; i < expected.length; i++) {
            verifySkillInfo(actualOrdered[i], expectedOrdered[i]);
        }
    }
    describe('createSkill', function () {
        it('should create a skill correctly', function () {
            var skillInfo = createSkillInfo(1);
            var skillPromise = skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo);
            return verifySkillInfoAsync(skillPromise, skillInfo);
        });
    });
    describe('getSkill', function () {
        it('no such skill should return null', function () {
            var skillPromise = skillsDataHandler_1.SkillsDataHandler.getSkill('not existing skill');
            return chai_1.expect(skillPromise).to.eventually.null;
        });
        it('skill exists should return correct skill', function () {
            var skillInfo = createSkillInfo(1);
            var createSkillPromise = skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo);
            var getSkillPromise = createSkillPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkill(skillInfo.name); });
            return verifySkillInfoAsync(getSkillPromise, skillInfo);
        });
    });
    describe('getSkills', function () {
        it('no skills should return empty', function () {
            var skillsPromise = skillsDataHandler_1.SkillsDataHandler.getSkills();
            var expectedSkillsInfo = [];
            return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillsInfo);
        });
        it('should return all created skills', function () {
            var skillInfo1 = createSkillInfo(1);
            var skillInfo2 = createSkillInfo(2);
            var skillInfo3 = createSkillInfo(3);
            var createAllSkillsPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo3)
            ]);
            var skillsPromose = createAllSkillsPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkills(); });
            var expectedSkillsInfo = [skillInfo1, skillInfo2, skillInfo3];
            return verifySkillsInfoWithoutOrderAsync(skillsPromose, expectedSkillsInfo);
        });
    });
    describe('addSkillPrerequisite', function () {
        it('should create a skillPrerequisite', function () {
            var skillInfo1 = createSkillInfo(1);
            var skillInfo2 = createSkillInfo(2);
            var createAllSkillsPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2)
            ]);
            var skillPrerequisitePromise = createAllSkillsPromise.then(function (skills) {
                var skill1 = skills[0];
                var skill2 = skills[1];
                var skillPrerequisiteInfo = createSkillPrerequisiteInfo(skill1, skill2);
                return skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo);
            });
            return chai_1.expect(skillPrerequisitePromise).to.eventually.fulfilled;
        });
    });
    describe('getSkillsPrerequisites', function () {
        it('no skill prerequisites should return empty', function () {
            var prerequisitesPromise = skillsDataHandler_1.SkillsDataHandler.getSkillsPrerequisites();
            var expectedPrerequisitesInfo = [];
            return verifySkillPrerequisitesInfoWithoutOrderAsync(prerequisitesPromise, expectedPrerequisitesInfo);
        });
        it('should return all created skill prerequisites', function () {
            var skillInfo1 = createSkillInfo(1);
            var skillInfo2 = createSkillInfo(2);
            var createAllSkillsPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2)
            ]);
            var skillPrerequisiteInfo1;
            var skillPrerequisiteInfo2;
            var createAllSkillPrerequisitesPromise = createAllSkillsPromise.then(function (skills) {
                var skill1 = skills[0];
                var skill2 = skills[1];
                skillPrerequisiteInfo1 = createSkillPrerequisiteInfo(skill1, skill2);
                skillPrerequisiteInfo2 = createSkillPrerequisiteInfo(skill2, skill1);
                return Promise.all([
                    skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo1),
                    skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skillPrerequisiteInfo2),
                ]);
            });
            var skillPrerequisitesPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillsPrerequisites(); });
            return skillPrerequisitesPromise.then(function () {
                var expectedSkillPrerequisitesInfos = [skillPrerequisiteInfo1, skillPrerequisiteInfo2];
                return verifySkillPrerequisitesInfoWithoutOrderAsync(skillPrerequisitesPromise, expectedSkillPrerequisitesInfos);
            });
        });
    });
    describe('getSkillPrerequisites', function () {
        var skillInfo1;
        var skillInfo2;
        var skillInfo3;
        var skill1;
        var skill2;
        var skill3;
        beforeEach(function () {
            skillInfo1 = createSkillInfo(1);
            skillInfo2 = createSkillInfo(2);
            skillInfo3 = createSkillInfo(3);
            return Promise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo3)
            ]).then(function (skills) {
                skill1 = skills[0];
                skill2 = skills[1];
                skill3 = skills[2];
            });
        });
        it('no such skill should return empty', function () {
            var skillsPromise = skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites('not existing skill');
            var expectedInfo = [];
            return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedInfo);
        });
        it('no skill prerequisites should return empty', function () {
            var skillsPromise = skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites(skillInfo1.name);
            var expectedInfo = [];
            return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedInfo);
        });
        it('should return all existing skill prerequisites', function () {
            var skill1PrerequisiteInfo1 = createSkillPrerequisiteInfo(skill1, skill2);
            var skill1PrerequisiteInfo2 = createSkillPrerequisiteInfo(skill1, skill3);
            var createAllSkillPrerequisitesPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo1),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo2)
            ]);
            var skillsPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites(skillInfo1.name); });
            var expectedSkillsInfos = [skillInfo2, skillInfo3];
            return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillsInfos);
        });
        it('should return all existing skill prerequisites and not return other prerequisites', function () {
            var skill1PrerequisiteInfo1 = createSkillPrerequisiteInfo(skill1, skill2);
            var skill1PrerequisiteInfo2 = createSkillPrerequisiteInfo(skill1, skill3);
            var skill2PrerequisiteInfo = createSkillPrerequisiteInfo(skill2, skill1);
            var createAllSkillPrerequisitesPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo1),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo2),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo)
            ]);
            var skillsPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillPrerequisites(skillInfo1.name); });
            var expectedSkillsInfos = [skillInfo2, skillInfo3];
            return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillsInfos);
        });
    });
    describe('getSkillContributions', function () {
        var skillInfo1;
        var skillInfo2;
        var skillInfo3;
        var skill1;
        var skill2;
        var skill3;
        beforeEach(function () {
            skillInfo1 = createSkillInfo(1);
            skillInfo2 = createSkillInfo(2);
            skillInfo3 = createSkillInfo(3);
            return Promise.all([
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo3)
            ]).then(function (skills) {
                skill1 = skills[0];
                skill2 = skills[1];
                skill3 = skills[2];
            });
        });
        it('no such skill should return empty', function () {
            var skillsPromise = skillsDataHandler_1.SkillsDataHandler.getSkillContributions('not existing skill');
            var expectedInfo = [];
            return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedInfo);
        });
        it('no skill prerequisites should return empty', function () {
            var skillsPromise = skillsDataHandler_1.SkillsDataHandler.getSkillContributions(skillInfo1.name);
            var expectedInfo = [];
            return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedInfo);
        });
        it('no skill prerequisites leading to skill should return empty', function () {
            var skill1PrerequisiteInfo1 = createSkillPrerequisiteInfo(skill1, skill2);
            var skill1PrerequisiteInfo2 = createSkillPrerequisiteInfo(skill1, skill3);
            var createAllSkillPrerequisitesPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo1),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill1PrerequisiteInfo2)
            ]);
            var skillsPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillContributions(skillInfo1.name); });
            var expectedInfo = [];
            return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedInfo);
        });
        it('should return all existing skills with prerequisites of this skill', function () {
            var skill2PrerequisiteInfo1 = createSkillPrerequisiteInfo(skill2, skill1);
            var skill3PrerequisiteInfo1 = createSkillPrerequisiteInfo(skill3, skill1);
            var createAllSkillPrerequisitesPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo1),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill3PrerequisiteInfo1)
            ]);
            var skillsPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillContributions(skillInfo1.name); });
            var expectedSkillInfos = [skillInfo2, skillInfo3];
            return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillInfos);
        });
        it('should return all existing skill with prerequisites of this skill and not return other skills', function () {
            var skill2PrerequisiteInfo1 = createSkillPrerequisiteInfo(skill2, skill1);
            var skill3PrerequisiteInfo1 = createSkillPrerequisiteInfo(skill3, skill1);
            var skill1PrerequisiteInfo2 = createSkillPrerequisiteInfo(skill1, skill2);
            var createAllSkillPrerequisitesPromise = Promise.all([
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill2PrerequisiteInfo1),
                skillsDataHandler_1.SkillsDataHandler.addSkillPrerequisite(skill3PrerequisiteInfo1)
            ]);
            var skillsPromise = createAllSkillPrerequisitesPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getSkillContributions(skillInfo1.name); });
            var expectedSkillInfos = [skillInfo2, skillInfo3];
            return verifySkillsInfoWithoutOrderAsync(skillsPromise, expectedSkillInfos);
        });
    });
    describe('getTeams', function () {
        function verifyTeamsAsync(actualTeamsPromise, expectedTeams) {
            return chai_1.expect(actualTeamsPromise).to.eventually.fulfilled
                .then(function (actualTeams) {
                var actualTeamInfos = _.map(actualTeams, function (_) { return _.team.attributes; });
                verifyTeams(actualTeamInfos, expectedTeams);
            });
        }
        function verifyTeams(actual, expected) {
            var actualOrdered = _.orderBy(actual, function (_) { return _.name; });
            var expectedOrdered = _.orderBy(expected, function (_) { return _.name; });
            chai_1.expect(actual.length).to.be.equal(expected.length);
            for (var i = 0; i < expected.length; i++) {
                verifyTeam(actualOrdered[i], expectedOrdered[i]);
            }
        }
        function verifyTeam(actual, expected) {
            var actualCloned = _.clone(actual);
            var expectedCloned = _.clone(expected);
            delete actualCloned['id'];
            delete expectedCloned['id'];
            chai_1.expect(actualCloned).to.be.deep.equal(expectedCloned);
        }
        function createTeamInfo(teamName) {
            return {
                name: teamName
            };
        }
        function createTeamSkillInfo(team, skill) {
            return {
                team_id: team.id,
                skill_id: skill.id
            };
        }
        function verifyTeamUpvotingUsersAsync(actualTeamsOfSkillPromise, expectedSkillUpdvotes) {
            return chai_1.expect(actualTeamsOfSkillPromise).to.eventually.fulfilled
                .then(function (actualTeams) {
                var orderedActualTeams = _.orderBy(actualTeams, function (_) { return _.team.id; });
                var actualUpvodtingUserIds = _.map(orderedActualTeams, function (_) { return _.upvotingUserIds.sort(); });
                var orderedExpectedUpvotes = _.orderBy(expectedSkillUpdvotes, function (_) { return _.teamId; });
                var expectedUpvotingUserIds = _.map(orderedExpectedUpvotes, function (_) { return _.upvotingUserIds.sort(); });
                chai_1.expect(actualUpvodtingUserIds).to.deep.equal(expectedUpvotingUserIds);
            });
        }
        function createUserInfo(userNumber) {
            return {
                username: 'username' + userNumber,
                password_hash: 'password' + userNumber,
                email: 'email' + userNumber + '@gmail.com',
                firstName: 'firstName' + userNumber,
                lastName: 'lastName' + userNumber
            };
        }
        var teamInfo1;
        var teamInfo2;
        var teamInfo3;
        var skillInfo1;
        var skillInfo2;
        var team1;
        var team2;
        var team3;
        var skill1;
        var skill2;
        var userInfo1;
        var userInfo2;
        var user1;
        var user2;
        beforeEach(function () {
            teamInfo1 = createTeamInfo('a');
            teamInfo2 = createTeamInfo('b');
            teamInfo3 = createTeamInfo('c');
            skillInfo1 = createSkillInfo(1);
            skillInfo2 = createSkillInfo(2);
            userInfo1 = createUserInfo(1);
            userInfo2 = createUserInfo(2);
            return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo1),
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo2),
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo3),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2),
                userDataHandler_1.UserDataHandler.createUser(userInfo1),
                userDataHandler_1.UserDataHandler.createUser(userInfo2)
            ]).then(function (results) {
                team1 = results[0];
                team2 = results[1];
                team3 = results[2];
                skill1 = results[3];
                skill2 = results[4];
                user1 = results[5];
                user2 = results[6];
            });
        });
        it('no such skill should return empty teams list', function () {
            var teamsPromise = skillsDataHandler_1.SkillsDataHandler.getTeams('not existing skill');
            return chai_1.expect(teamsPromise).to.eventually.deep.equal([]);
        });
        it('skill exists but has no teams should return empty teams list', function () {
            var teamsPromise = skillsDataHandler_1.SkillsDataHandler.getTeams(skillInfo1.name);
            return chai_1.expect(teamsPromise).to.eventually.deep.equal([]);
        });
        it('skill exists with teams should return correct teams', function () {
            var teamSkillInfo1 = createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = createTeamSkillInfo(team2, skill1);
            var addSkillsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo2)
            ]);
            var teamsPromise = addSkillsPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getTeams(skillInfo1.name); });
            var expectedTeams = [teamInfo1, teamInfo2];
            return verifyTeamsAsync(teamsPromise, expectedTeams);
        });
        it('skill exists with teams should return correct upvoting user ids', function () {
            var teamSkillInfo1 = createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = createTeamSkillInfo(team2, skill1);
            var teamSkillInfo3 = createTeamSkillInfo(team3, skill1);
            var addSkillsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo3)
            ]);
            var teamsPromise = addSkillsPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getTeams(skillInfo1.name); });
            var expectedSkillUpvotes = [
                { teamId: teamSkillInfo1.team_id, upvotingUserIds: [] },
                { teamId: teamSkillInfo2.team_id, upvotingUserIds: [] },
                { teamId: teamSkillInfo3.team_id, upvotingUserIds: [] }
            ];
            return verifyTeamUpvotingUsersAsync(teamsPromise, expectedSkillUpvotes);
        });
        it('multiple skills exist with teams should return correct teams', function () {
            var teamSkillInfo1 = createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = createTeamSkillInfo(team2, skill1);
            var teamSkillInfo3 = createTeamSkillInfo(team1, skill2);
            var addSkillsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo3)
            ]);
            var teamsPromise = addSkillsPromise.then(function () { return skillsDataHandler_1.SkillsDataHandler.getTeams(skillInfo1.name); });
            var expectedTeams = [teamInfo1, teamInfo2];
            return verifyTeamsAsync(teamsPromise, expectedTeams);
        });
        it('skill exists with teams with upvotes should return correct upvoting user ids', function () {
            var team1SkillInfo = createTeamSkillInfo(team1, skill1);
            var team2SkillInfo = createTeamSkillInfo(team2, skill1);
            var team3SkillInfo = createTeamSkillInfo(team3, skill1);
            var addSkillsAndUpvote = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(team1SkillInfo),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(team2SkillInfo),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(team3SkillInfo)
            ]).then(function (teamSkills) {
                var team1Skill = teamSkills[0], team2Skill = teamSkills[1], team3Skill = teamSkills[2];
                return Promise.all([
                    teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(team1Skill.id, user1.id),
                    teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(team1Skill.id, user2.id),
                    teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(team2Skill.id, user2.id),
                ]);
            });
            var teamsPromise = addSkillsAndUpvote.then(function () { return skillsDataHandler_1.SkillsDataHandler.getTeams(skillInfo1.name); });
            var expectedSkillUpvotes = [
                { teamId: team1.id, upvotingUserIds: [user1.id, user2.id] },
                { teamId: team2.id, upvotingUserIds: [user2.id] },
                { teamId: team3.id, upvotingUserIds: [] }
            ];
            return verifyTeamUpvotingUsersAsync(teamsPromise, expectedSkillUpvotes);
        });
    });
});
