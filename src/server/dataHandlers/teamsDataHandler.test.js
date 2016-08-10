"use strict";
var modelInfoVerificator_1 = require("../testUtils/modelInfoVerificator");
var environmentDirtifier_1 = require("../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var modelInfoComparers_1 = require("../testUtils/modelInfoComparers");
var modelVerificator_1 = require("../testUtils/modelVerificator");
var teamSkillUpvote_1 = require("../models/teamSkillUpvote");
var modelInfoMockFactory_1 = require("../testUtils/modelInfoMockFactory");
var skillsDataHandler_1 = require("./skillsDataHandler");
var chai = require('chai');
var chai_1 = require('chai');
var _ = require('lodash');
var chaiAsPromised = require('chai-as-promised');
var teamMember_1 = require('../models/teamMember');
var teamsDataHandler_1 = require('./teamsDataHandler');
var userDataHandler_1 = require('./userDataHandler');
var teamSkill_1 = require('../models/teamSkill');
var bluebirdPromise = require('bluebird');
chai.use(chaiAsPromised);
describe('TeamsDataHandler', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('createTeam', function () {
        var user;
        beforeEach(function () {
            return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) {
                user = _users[0];
            });
        });
        it('should create a team correctly', function () {
            var teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('a');
            var teamPromise = teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo, user.id);
            return modelVerificator_1.ModelVerificator.verifyModelInfoAsync(teamPromise, teamInfo);
        });
        it('should add the creator to team creators', function () {
            var teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('1');
            var teamPromise = teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo, user.id);
            var team;
            return chai_1.expect(teamPromise).to.eventually.fulfilled
                .then(function (_team) {
                team = _team;
            })
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamsCreators(); })
                .then(function (_teamsCreators) {
                chai_1.expect(_teamsCreators).to.be.length(1);
                var expectedInfo = {
                    user_id: user.id,
                    team_id: team.id
                };
                modelInfoVerificator_1.ModelInfoVerificator.verifyInfo(_teamsCreators[0].attributes, expectedInfo);
            });
        });
    });
    describe('deleteTeam', function () {
        var testModels;
        beforeEach(function () {
            return environmentDirtifier_1.EnvironmentDirtifier.fillAllTables()
                .then(function (_testModels) {
                testModels = _testModels;
            });
        });
        it('not existing team should not fail', function () {
            var promise = teamsDataHandler_1.TeamsDataHandler.deleteTeam(9999);
            return chai_1.expect(promise).to.eventually.fulfilled;
        });
        it('existing team should not fail', function () {
            var teamToDelete = testModels.teams[0];
            var promise = teamsDataHandler_1.TeamsDataHandler.deleteTeam(teamToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled;
        });
        it('existing team should remove the team', function () {
            var teamToDelete = testModels.teams[0];
            var promise = teamsDataHandler_1.TeamsDataHandler.deleteTeam(teamToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeam(teamToDelete.id); })
                .then(function (team) {
                chai_1.expect(team).to.be.null;
            });
        });
        it('existing team should remove the relevant team skills', function () {
            var teamToDelete = testModels.teams[0];
            var promise = teamsDataHandler_1.TeamsDataHandler.deleteTeam(teamToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return new teamSkill_1.TeamSkills().fetch(); })
                .then(function (_teamSkillsCollection) { return _teamSkillsCollection.toArray(); })
                .then(function (_teamSkills) {
                return _.map(_teamSkills, function (_) { return _.attributes.team_id; });
            })
                .then(function (_skillIds) {
                chai_1.expect(_skillIds).not.to.contain(teamToDelete.id);
            });
        });
        it('existing team should remove the relevant team members', function () {
            var teamToDelete = testModels.teams[0];
            var promise = teamsDataHandler_1.TeamsDataHandler.deleteTeam(teamToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return new teamMember_1.TeamMembers().fetch(); })
                .then(function (_teamMembersCollection) { return _teamMembersCollection.toArray(); })
                .then(function (_teamMembers) {
                return _.map(_teamMembers, function (_) { return _.attributes.team_id; });
            })
                .then(function (_skillIds) {
                chai_1.expect(_skillIds).not.to.contain(teamToDelete.id);
            });
        });
        it('existing team should remove the relevant team skill upvotes', function () {
            var teamToDelete = testModels.teams[0];
            var promise = teamsDataHandler_1.TeamsDataHandler.deleteTeam(teamToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return new teamSkillUpvote_1.TeamSkillUpvotes().fetch(); })
                .then(function (_teamSkillUpvotesCollection) { return _teamSkillUpvotesCollection.toArray(); })
                .then(function (_teamSkillsUpvotes) {
                return _.map(_teamSkillsUpvotes, function (_) { return _.attributes.team_skill_id; });
            })
                .then(function (_teamSkillIds) {
                return _.filter(testModels.teamSkills, function (_) { return _teamSkillIds.indexOf(_.id) >= 0; });
            })
                .then(function (_teamSkills) {
                return _.map(_teamSkills, function (_) { return _.attributes.team_id; });
            })
                .then(function (_teamIds) {
                chai_1.expect(_teamIds).not.to.contain(teamToDelete.id);
            });
        });
        it('existing team should remove the relevant team creators', function () {
            var teamToDelete = testModels.teams[0];
            var promise = teamsDataHandler_1.TeamsDataHandler.deleteTeam(teamToDelete.id);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamsCreators(); })
                .then(function (_creators) {
                return _.map(_creators, function (_) { return _.attributes.team_id; });
            })
                .then(function (_teamIds) {
                chai_1.expect(_teamIds).not.to.contain(teamToDelete.id);
            });
        });
    });
    describe('getTeam', function () {
        it('no such team should return null', function () {
            var teamPromise = teamsDataHandler_1.TeamsDataHandler.getTeam(9999999);
            return chai_1.expect(teamPromise).to.eventually.null;
        });
        it('team exists should return correct team', function () {
            var teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('a');
            var createTeamPromose = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo, _users[0].id); });
            var getTeamPromise = createTeamPromose.then(function (team) { return teamsDataHandler_1.TeamsDataHandler.getTeam(team.id); });
            return modelVerificator_1.ModelVerificator.verifyModelInfoAsync(getTeamPromise, teamInfo);
        });
    });
    describe('getTeamByName', function () {
        it('no such team should return null', function () {
            var teamPromise = teamsDataHandler_1.TeamsDataHandler.getTeamByName('not existing team name');
            return chai_1.expect(teamPromise).to.eventually.null;
        });
        it('team exists should return correct team', function () {
            var teamName = 'a';
            var teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo(teamName);
            var createTeamPromose = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo, _users[0].id); });
            var getTeamPromise = createTeamPromose.then(function (team) { return teamsDataHandler_1.TeamsDataHandler.getTeamByName(teamName); });
            return modelVerificator_1.ModelVerificator.verifyModelInfoAsync(getTeamPromise, teamInfo);
        });
    });
    describe('getTeams', function () {
        it('no teams should return empty', function () {
            var teamsPromise = teamsDataHandler_1.TeamsDataHandler.getTeams();
            return chai_1.expect(teamsPromise).to.eventually.deep.equal([]);
        });
        it('teams exist should return correct teams', function () {
            var teamInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('a');
            var teamInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('b');
            var teamInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('c');
            var createTeamsPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo1, _users[0].id),
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo2, _users[0].id),
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo3, _users[0].id)
            ]); });
            var getTeamsPromise = createTeamsPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeams(); });
            var expectedInfos = [teamInfo1, teamInfo2, teamInfo3];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(getTeamsPromise, expectedInfos, modelInfoComparers_1.ModelInfoComparers.compareTeamInfos);
        });
    });
    describe('addTeamMember', function () {
        it('should create a team member', function () {
            var teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('a');
            var userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var user;
            var createTeamAndUserPromise = userDataHandler_1.UserDataHandler.createUser(userInfo)
                .then(function (_user) {
                user = _user;
            })
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo, user.id); });
            var teamMemberPromise = createTeamAndUserPromise.then(function (_team) {
                var team = _team;
                var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team, user);
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
            return chai_1.expect(teamMemberPromise).to.eventually.fulfilled;
        });
    });
    describe('removeTeamMember', function () {
        var testModels;
        beforeEach(function () {
            return environmentDirtifier_1.EnvironmentDirtifier.fillAllTables()
                .then(function (_testModels) {
                testModels = _testModels;
            });
        });
        it('not existing team id should not fail', function () {
            var teamMember = testModels.teamMembers[0];
            var promise = teamsDataHandler_1.TeamsDataHandler.removeTeamMember(9999, teamMember.attributes.user_id);
            return chai_1.expect(promise).to.eventually.fulfilled;
        });
        it('not existing user id should not fail', function () {
            var teamMember = testModels.teamMembers[0];
            var promise = teamsDataHandler_1.TeamsDataHandler.removeTeamMember(teamMember.attributes.team_id, 99999);
            return chai_1.expect(promise).to.eventually.fulfilled;
        });
        it('existing team member should not fail', function () {
            var teamMemberToDelete = testModels.teamMembers[0];
            var teamId = teamMemberToDelete.attributes.team_id;
            var userId = teamMemberToDelete.attributes.user_id;
            var promise = teamsDataHandler_1.TeamsDataHandler.removeTeamMember(teamId, userId);
            return chai_1.expect(promise).to.eventually.fulfilled;
        });
        it('existing team member should remove the team member', function () {
            var teamMemberToDelete = testModels.teamMembers[0];
            var teamId = teamMemberToDelete.attributes.team_id;
            var userId = teamMemberToDelete.attributes.user_id;
            var promise = teamsDataHandler_1.TeamsDataHandler.removeTeamMember(teamId, userId);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return new teamMember_1.TeamMembers().fetch(); })
                .then(function (_teamMembersCollection) {
                return _teamMembersCollection.toArray();
            })
                .then(function (_teamMembers) {
                return _.map(_teamMembers, function (_) { return _.id; });
            })
                .then(function (teamMemberIds) {
                chai_1.expect(teamMemberIds).not.to.contain(teamMemberToDelete.id);
            });
        });
    });
    describe('getTeamMembers', function () {
        function verifyUsersAdminSettingsWithoutOrderAsync(actualUserOfATeamsPromise, expectedAdminSettings) {
            return chai_1.expect(actualUserOfATeamsPromise).to.eventually.fulfilled
                .then(function (actualTeams) {
                var orderedActualUsers = _.orderBy(actualTeams, function (_) { return _.user.id; });
                var actualIsAdmin = _.map(orderedActualUsers, function (_) { return _.isAdmin; });
                var orderedExpectedAdminSettings = _.orderBy(expectedAdminSettings, function (_) { return _.userId; });
                var expectedIsAdmin = _.map(orderedExpectedAdminSettings, function (_) { return _.isAdmin; });
                chai_1.expect(actualIsAdmin).to.deep.equal(expectedIsAdmin);
            });
        }
        var userInfo1;
        var userInfo2;
        var userInfo3;
        var user1;
        var user2;
        var user3;
        var teamInfo1;
        var teamInfo2;
        var team1;
        var team2;
        beforeEach(function () {
            userInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            userInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2);
            userInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(3);
            teamInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('a');
            teamInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('b');
            return Promise.all([
                userDataHandler_1.UserDataHandler.createUser(userInfo1),
                userDataHandler_1.UserDataHandler.createUser(userInfo2),
                userDataHandler_1.UserDataHandler.createUser(userInfo3)
            ])
                .then(function (_users) {
                user1 = _users[0], user2 = _users[1], user3 = _users[2];
            })
                .then(function () { return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo1, user1.id),
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo2, user1.id)
            ]); }).then(function (_teams) {
                team1 = _teams[0], team2 = _teams[1];
            });
        });
        it('not existing team should return empty', function () {
            var teamMembersPromise = teamsDataHandler_1.TeamsDataHandler.getTeamMembers(999999);
            return chai_1.expect(teamMembersPromise).to.eventually.deep.equal([]);
        });
        it('no team members should return empty', function () {
            var teamMembersPromise = teamsDataHandler_1.TeamsDataHandler.getTeamMembers(team1.id);
            return chai_1.expect(teamMembersPromise).to.eventually.deep.equal([]);
        });
        it('should return all existing team members', function () {
            var teamMemberInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
            var teamMemberInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team1, user2);
            var createAllTeamMembersPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo2)
            ]);
            var usersPromise = createAllTeamMembersPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(team1.id); })
                .then(function (teamMembers) {
                return _.map(teamMembers, function (_) { return _.user; });
            });
            var expectedUserInfo = [userInfo1, userInfo2];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(usersPromise, expectedUserInfo, modelInfoComparers_1.ModelInfoComparers.compareUserInfos);
        });
        it('should return all existing team members with correct admin rights', function () {
            var teamMemberInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
            teamMemberInfo1.is_admin = true;
            var teamMemberInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team1, user2);
            teamMemberInfo2.is_admin = false;
            var teamMemberInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team1, user3);
            teamMemberInfo3.is_admin = true;
            var createAllTeamMembersPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo3)
            ]);
            var teamMembersPromise = createAllTeamMembersPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(team1.id); });
            var expectedUserAdminConfigurations = [
                { userId: teamMemberInfo1.user_id, isAdmin: teamMemberInfo1.is_admin },
                { userId: teamMemberInfo2.user_id, isAdmin: teamMemberInfo2.is_admin },
                { userId: teamMemberInfo3.user_id, isAdmin: teamMemberInfo3.is_admin }
            ];
            return verifyUsersAdminSettingsWithoutOrderAsync(teamMembersPromise, expectedUserAdminConfigurations);
        });
        it('should return all existing team members and not return other members', function () {
            var teamMemberInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team1, user1);
            var teamMemberInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team1, user2);
            var teamMemberInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team2, user1);
            var teamMemberInfo4 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team2, user3);
            var createAllTeamMembersPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo3),
                teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo4)
            ]);
            var usersPromise = createAllTeamMembersPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(team1.id); })
                .then(function (usersOfATeam) {
                return _.map(usersOfATeam, function (_) { return _.user; });
            });
            var expectedUserInfo = [userInfo1, userInfo2];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(usersPromise, expectedUserInfo, modelInfoComparers_1.ModelInfoComparers.compareUserInfos);
        });
    });
    describe('addTeamSkill', function () {
        it('should create a team skill', function () {
            var teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('a');
            var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill1');
            var createTeamAndSkillsPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo, _users[0].id),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo, _users[0].id)
            ]); });
            var teamSkillPromise = createTeamAndSkillsPromise.then(function (teamAndSkill) {
                var team = teamAndSkill[0];
                var skill = teamAndSkill[1];
                var teamSkillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team, skill);
                return teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo);
            });
            return chai_1.expect(teamSkillPromise).to.eventually.fulfilled;
        });
    });
    describe('removeTeamSkill', function () {
        var testModels;
        beforeEach(function () {
            return environmentDirtifier_1.EnvironmentDirtifier.fillAllTables()
                .then(function (_testModels) {
                testModels = _testModels;
            });
        });
        it('not existing team id should not fail', function () {
            var teamSkill = testModels.teamSkills[0];
            var promise = teamsDataHandler_1.TeamsDataHandler.removeTeamSkill(9999, teamSkill.attributes.skill_id);
            return chai_1.expect(promise).to.eventually.fulfilled;
        });
        it('not existing skill id should not fail', function () {
            var teamSkill = testModels.teamSkills[0];
            var promise = teamsDataHandler_1.TeamsDataHandler.removeTeamSkill(teamSkill.attributes.team_id, 99999);
            return chai_1.expect(promise).to.eventually.fulfilled;
        });
        it('existing team skill should not fail', function () {
            var teamSkillToDelete = testModels.teamSkills[0];
            var teamId = teamSkillToDelete.attributes.team_id;
            var skillId = teamSkillToDelete.attributes.skill_id;
            var promise = teamsDataHandler_1.TeamsDataHandler.removeTeamSkill(teamId, skillId);
            return chai_1.expect(promise).to.eventually.fulfilled;
        });
        it('existing team skill should remove the team skill', function () {
            var teamSkillToDelete = testModels.teamSkills[0];
            var teamId = teamSkillToDelete.attributes.team_id;
            var skillId = teamSkillToDelete.attributes.skill_id;
            var promise = teamsDataHandler_1.TeamsDataHandler.removeTeamSkill(teamId, skillId);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return new teamSkill_1.TeamSkills().fetch(); })
                .then(function (_teamSkillsCollection) {
                return _teamSkillsCollection.toArray();
            })
                .then(function (_teamSkills) {
                return _.map(_teamSkills, function (_) { return _.id; });
            })
                .then(function (teamSkillIds) {
                chai_1.expect(teamSkillIds).not.to.contain(teamSkillToDelete.id);
            });
        });
        it('existing team skill should remove all the team skill upvotes', function () {
            var teamSkillToDelete = testModels.teamSkills[0];
            var teamId = teamSkillToDelete.attributes.team_id;
            var skillId = teamSkillToDelete.attributes.skill_id;
            var promise = teamsDataHandler_1.TeamsDataHandler.removeTeamSkill(teamId, skillId);
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function () { return new teamSkillUpvote_1.TeamSkillUpvotes().fetch(); })
                .then(function (_teamSkillUpvotesCollection) {
                return _teamSkillUpvotesCollection.toArray();
            })
                .then(function (_teamSkillUpvotes) {
                return _.map(_teamSkillUpvotes, function (_) { return _.attributes.team_skill_id; });
            })
                .then(function (teamSkillIds) {
                chai_1.expect(teamSkillIds).not.to.contain(teamSkillToDelete.id);
            });
        });
    });
    describe('getTeamSkills', function () {
        function verifySkillsUpvotesWithoutOrderAsync(actualSkillsOfATeamPromise, expectedSkillIdToUpvotes) {
            return chai_1.expect(actualSkillsOfATeamPromise).to.eventually.fulfilled
                .then(function (actualSkills) {
                var orderedActualUsers = _.orderBy(actualSkills, function (_) { return _.skill.id; });
                var actualUpvotingUserIds = _.map(orderedActualUsers, function (_) { return _.upvotingUserIds.sort(); });
                var orderedExpectedUpvotes = _.orderBy(expectedSkillIdToUpvotes, function (_) { return _.skillId; });
                var expectedUpvotingUserIds = _.map(orderedExpectedUpvotes, function (_) { return _.upvotingUserIds.sort(); });
                chai_1.expect(actualUpvotingUserIds).to.deep.equal(expectedUpvotingUserIds);
            });
        }
        var skillInfo1;
        var skillInfo2;
        var skillInfo3;
        var skill1;
        var skill2;
        var skill3;
        var teamInfo1;
        var teamInfo2;
        var team1;
        var team2;
        var userInfo1;
        var userInfo2;
        var user1;
        var user2;
        beforeEach(function () {
            userInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            userInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2);
            skillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill1');
            skillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill2');
            skillInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill3');
            teamInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('a');
            teamInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('b');
            return Promise.all([
                userDataHandler_1.UserDataHandler.createUser(userInfo1),
                userDataHandler_1.UserDataHandler.createUser(userInfo2)
            ])
                .then(function (results) {
                user1 = results[0];
                user2 = results[1];
            })
                .then(function () { return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo1, user1.id),
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo2, user1.id),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo1, user1.id),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo2, user1.id),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo3, user1.id)
            ]); }).then(function (results) {
                team1 = results[0];
                team2 = results[1];
                skill1 = results[2];
                skill2 = results[3];
                skill3 = results[4];
            });
        });
        it('not existing team should return empty', function () {
            var teamSkillsPromise = teamsDataHandler_1.TeamsDataHandler.getTeamSkills(99999);
            return chai_1.expect(teamSkillsPromise).to.eventually.deep.equal([]);
        });
        it('no team members should return empty', function () {
            var teamSkillsPromise = teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team1.id);
            return chai_1.expect(teamSkillsPromise).to.eventually.deep.equal([]);
        });
        it('should return all existing team skills', function () {
            var teamSkillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill2);
            var createAllTeamSkillsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo2)
            ]);
            var skillsPromise = createAllTeamSkillsPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team1.id); })
                .then(function (skillsOfATeam) {
                return _.map(skillsOfATeam, function (_) { return _.skill; });
            });
            var expectedSkillInfo = [skillInfo1, skillInfo2];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(skillsPromise, expectedSkillInfo, modelInfoComparers_1.ModelInfoComparers.compareSkillInfos);
        });
        it('should return correct teamSkills', function () {
            var teamSkillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill2);
            var createAllTeamSkillsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo2)
            ]);
            var teamSkillsPromise = createAllTeamSkillsPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team1.id); })
                .then(function (skillsOfATeam) {
                return _.map(skillsOfATeam, function (_) { return _.teamSkill; });
            });
            var expectedTeamSkillInfo = [teamSkillInfo1, teamSkillInfo2];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(teamSkillsPromise, expectedTeamSkillInfo, modelInfoComparers_1.ModelInfoComparers.compareTeamSkillInfos);
        });
        it('should return all existing team skills with correct upvoting user ids', function () {
            var teamSkillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill2);
            var teamSkillInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill3);
            var createAllTeamSkillsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo3)
            ]);
            var teamSkillsPromise = createAllTeamSkillsPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team1.id); });
            var expectedSkillUpvotes = [
                { skillId: teamSkillInfo1.skill_id, upvotingUserIds: [] },
                { skillId: teamSkillInfo2.skill_id, upvotingUserIds: [] },
                { skillId: teamSkillInfo3.skill_id, upvotingUserIds: [] }
            ];
            return verifySkillsUpvotesWithoutOrderAsync(teamSkillsPromise, expectedSkillUpvotes);
        });
        it('should return all existing skills and not return other skills', function () {
            var teamSkillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill2);
            var teamSkillInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team2, skill1);
            var teamSkillInfo4 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team2, skill3);
            var createAllTeamSkillsPromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo3),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo4)
            ]);
            var teamSkillsPromise = createAllTeamSkillsPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team1.id); })
                .then(function (skillsOfATeam) {
                return _.map(skillsOfATeam, function (_) { return _.skill; });
            });
            var expectedSkillsInfo = [skillInfo1, skillInfo2];
            return modelVerificator_1.ModelVerificator.verifyMultipleModelInfosOrderedAsync(teamSkillsPromise, expectedSkillsInfo, modelInfoComparers_1.ModelInfoComparers.compareSkillInfos);
        });
        it('after upvoting skills should return all existing team skills with correct upvoting user ids', function () {
            var teamSkillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill2);
            var teamSkillInfo3 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill3);
            var createSkillsAndUpvotePromise = Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo1),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo2),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo3)
            ]).then(function (teamSkills) {
                var teamSkill1 = teamSkills[0], teamSkill2 = teamSkills[1], teamSkill3 = teamSkills[2];
                return Promise.all([
                    teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkill1.id, user1.id),
                    teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkill1.id, user2.id),
                    teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkill2.id, user2.id)
                ]);
            });
            var teamSkillsPromise = createSkillsAndUpvotePromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team1.id); });
            var expectedSkillUpvotes = [
                { skillId: skill1.id, upvotingUserIds: [user1.id, user2.id] },
                { skillId: skill2.id, upvotingUserIds: [user2.id] },
                { skillId: skill3.id, upvotingUserIds: [] }
            ];
            return verifySkillsUpvotesWithoutOrderAsync(teamSkillsPromise, expectedSkillUpvotes);
        });
    });
    describe('upvoteTeamSkill', function () {
        var teamInfo;
        var team;
        var user1;
        var user2;
        var teamSkill;
        beforeEach(function () {
            teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team 1');
            var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill 1');
            var userInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var userInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2);
            return Promise.all([
                userDataHandler_1.UserDataHandler.createUser(userInfo1),
                userDataHandler_1.UserDataHandler.createUser(userInfo2)
            ])
                .then(function (_users) {
                user1 = _users[0], user2 = _users[1];
            })
                .then(function () { return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo, user1.id),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo, user1.id),
            ]); }).then(function (teamAndSkill) {
                team = teamAndSkill[0];
                var skill = teamAndSkill[1];
                var teamSkillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team, skill);
                return teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo);
            }).then(function (_teamSkill) {
                teamSkill = _teamSkill;
            });
        });
        it('upvote with non existing team skill id should fail', function () {
            var teamSkillId = teamSkill.id + 1;
            var userId = user1.id;
            var upvotePromise = teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId);
            return chai_1.expect(upvotePromise).to.eventually.rejected;
        });
        it('upvote with non existing user id should fail', function () {
            var teamSkillId = teamSkill.id;
            var userId = user1.id + user2.id + 1;
            var upvotePromise = teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId);
            return chai_1.expect(upvotePromise).to.eventually.rejected;
        });
        it('upvote should set the upvoting user ids correctly', function () {
            var teamSkillId = teamSkill.id;
            var userId = user1.id;
            var upvotePromise = teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId);
            return chai_1.expect(upvotePromise).to.eventually.fulfilled
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                .then(function (skillsOfATeam) {
                chai_1.expect(skillsOfATeam.length).to.be.equal(1);
                chai_1.expect(skillsOfATeam[0].upvotingUserIds).to.be.deep.equal([userId]);
            });
        });
        it('upvote with same user twice should fail', function () {
            var teamSkillId = teamSkill.id;
            var userId = user1.id;
            var upvotePromise = teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId)
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId); });
            return chai_1.expect(upvotePromise).to.eventually.rejected;
        });
        it('upvote with same user twice should set the upvoting user ids correctly', function () {
            var teamSkillId = teamSkill.id;
            var userId = user1.id;
            var upvotePromise = teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId)
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId); });
            return chai_1.expect(upvotePromise).to.eventually.rejected
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                .then(function (skillsOfATeam) {
                chai_1.expect(skillsOfATeam.length).to.be.equal(1);
                chai_1.expect(skillsOfATeam[0].upvotingUserIds).to.be.deep.equal([userId]);
            });
        });
        it('upvote with different user twice set the upvoting user ids correctly', function () {
            var teamSkillId = teamSkill.id;
            var userId1 = user1.id;
            var userId2 = user2.id;
            var upvotePromise = teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId1)
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkillId, userId2); });
            return chai_1.expect(upvotePromise).to.eventually.fulfilled
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                .then(function (skillsOfATeam) {
                chai_1.expect(skillsOfATeam.length).to.be.equal(1);
                chai_1.expect(skillsOfATeam[0].upvotingUserIds.sort()).to.be.deep.equal([userId1, userId2].sort());
            });
        });
    });
    describe('removeUpvoteForTeamSkill', function () {
        var upvotedUser1;
        var upvotedUser2;
        var notUpvotedUser;
        var teamInfo;
        var team;
        var teamSkill;
        beforeEach(function () {
            teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team 1');
            var skillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill 1');
            var upvotedUserInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var upvotedUserInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2);
            var notUpvotedUserInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(3);
            return Promise.all([
                userDataHandler_1.UserDataHandler.createUser(upvotedUserInfo1),
                userDataHandler_1.UserDataHandler.createUser(upvotedUserInfo2),
                userDataHandler_1.UserDataHandler.createUser(notUpvotedUserInfo)
            ])
                .then(function (_users) {
                upvotedUser1 = _users[0];
                upvotedUser2 = _users[1];
                notUpvotedUser = _users[2];
            })
                .then(function () { return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo, upvotedUser1.id),
                skillsDataHandler_1.SkillsDataHandler.createSkill(skillInfo, upvotedUser1.id),
            ]); }).then(function (teamSkillAndUser) {
                team = teamSkillAndUser[0];
                var skill = teamSkillAndUser[1];
                var teamSkillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team, skill);
                return teamsDataHandler_1.TeamsDataHandler.addTeamSkill(teamSkillInfo);
            }).then(function (_teamSkill) {
                teamSkill = _teamSkill;
                return Promise.all([
                    teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkill.id, upvotedUser1.id),
                    teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(teamSkill.id, upvotedUser2.id)
                ]);
            });
        });
        it('with non existing team skill id should fail', function () {
            var teamSkillId = teamSkill.id + 1;
            var userId = upvotedUser1.id;
            var promise = teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId);
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('with non existing user id should fail', function () {
            var teamSkillId = teamSkill.id;
            var userId = upvotedUser1.id + upvotedUser2.id + notUpvotedUser.id + 1;
            var promise = teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId);
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('with user who did not upvote should fail', function () {
            var teamSkillId = teamSkill.id;
            var userId = notUpvotedUser.id;
            var promise = teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId);
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('with user who did not upvote should set the upvoting user ids correctly', function () {
            var teamSkillId = teamSkill.id;
            var userId = notUpvotedUser.id;
            var removeUpvotePromise = teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId);
            return chai_1.expect(removeUpvotePromise).to.eventually.rejected
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                .then(function (skillsOfATeam) {
                chai_1.expect(skillsOfATeam.length).to.be.equal(1);
                chai_1.expect(skillsOfATeam[0].upvotingUserIds.sort()).to.be.deep.equal([upvotedUser1.id, upvotedUser2.id].sort());
            });
        });
        it('with user who upvoted should set the upvoting user ids correctly', function () {
            var teamSkillId = teamSkill.id;
            var userId = upvotedUser1.id;
            var removeUpvotePromise = teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId);
            return chai_1.expect(removeUpvotePromise).to.eventually.fulfilled
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                .then(function (skillsOfATeam) {
                chai_1.expect(skillsOfATeam.length).to.be.equal(1);
                chai_1.expect(skillsOfATeam[0].upvotingUserIds).to.be.deep.equal([upvotedUser2.id]);
            });
        });
        it('with same user twice should fail', function () {
            var teamSkillId = teamSkill.id;
            var userId = upvotedUser1.id;
            var removeUpvotePromise = teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId)
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId); });
            return chai_1.expect(removeUpvotePromise).to.eventually.rejected;
        });
        it('with same user twice should set the upvoting user ids correctly', function () {
            var teamSkillId = teamSkill.id;
            var userId = upvotedUser1.id;
            var removeUpvotePromise = teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId)
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId); });
            return chai_1.expect(removeUpvotePromise).to.eventually.rejected
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                .then(function (skillsOfATeam) {
                chai_1.expect(skillsOfATeam.length).to.be.equal(1);
                chai_1.expect(skillsOfATeam[0].upvotingUserIds).to.be.deep.equal([upvotedUser2.id]);
            });
        });
        it('with different user twice set the upvoting user ids correctly', function () {
            var teamSkillId = teamSkill.id;
            var userId1 = upvotedUser1.id;
            var userId2 = upvotedUser2.id;
            var upvotePromise = teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId1)
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.removeUpvoteForTeamSkill(teamSkillId, userId2); });
            return chai_1.expect(upvotePromise).to.eventually.fulfilled
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamSkills(team.id); })
                .then(function (skillsOfATeam) {
                chai_1.expect(skillsOfATeam.length).to.be.equal(1);
                chai_1.expect(skillsOfATeam[0].upvotingUserIds).to.be.deep.equal([]);
            });
        });
    });
    describe('setAdminRights', function () {
        var teamInfo;
        var team;
        var teamMemberInfo;
        var userInfo;
        beforeEach(function () {
            teamInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('team 1');
            userInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1);
            var user;
            return userDataHandler_1.UserDataHandler.createUser(userInfo)
                .then(function (_user) {
                user = _user;
            })
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo, user.id); })
                .then(function (_team) {
                team = _team;
                teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamMemberInfo(team, user);
                teamMemberInfo.is_admin = false;
                return teamsDataHandler_1.TeamsDataHandler.addTeamMember(teamMemberInfo);
            });
        });
        it('with non existing team id should fail', function () {
            var teamId = teamMemberInfo.team_id + 1;
            var userId = teamMemberInfo.user_id;
            var adminRightsPromise = teamsDataHandler_1.TeamsDataHandler.setAdminRights(teamId, userId, true);
            return chai_1.expect(adminRightsPromise).to.eventually.rejected;
        });
        it('with non existing user id should fail', function () {
            var teamId = teamMemberInfo.team_id;
            var userId = teamMemberInfo.user_id + 1;
            var adminRightsPromise = teamsDataHandler_1.TeamsDataHandler.setAdminRights(teamId, userId, true);
            return chai_1.expect(adminRightsPromise).to.eventually.rejected;
        });
        it('should update the is_admin to true correctly', function () {
            var teamId = teamMemberInfo.team_id;
            var userId = teamMemberInfo.user_id;
            var adminRightsPromise = teamsDataHandler_1.TeamsDataHandler.setAdminRights(teamId, userId, true);
            return chai_1.expect(adminRightsPromise).to.eventually.fulfilled
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(team.id); })
                .then(function (usersOfATeam) {
                chai_1.expect(usersOfATeam.length).to.be.equal(1);
                chai_1.expect(usersOfATeam[0].isAdmin).to.be.true;
            });
        });
        it('should update the is_admin to false correctly', function () {
            var teamId = teamMemberInfo.team_id;
            var userId = teamMemberInfo.user_id;
            var adminRightsPromise = teamsDataHandler_1.TeamsDataHandler.setAdminRights(teamId, userId, true)
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.setAdminRights(teamId, userId, false); });
            return chai_1.expect(adminRightsPromise).to.eventually.fulfilled
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamMembers(team.id); })
                .then(function (usersOfATeam) {
                chai_1.expect(usersOfATeam.length).to.be.equal(1);
                chai_1.expect(usersOfATeam[0].isAdmin).to.be.false;
            });
        });
    });
    describe('getSkillsOfTeams', function () {
        function createTeamToSkills(team, teamSkills, skills) {
            var result = {
                team: team,
                skills: []
            };
            for (var i = 0; i < teamSkills.length; i++) {
                result.skills.push({
                    skill: skills[i],
                    teamSkill: teamSkills[i],
                    upvotingUserIds: []
                });
            }
            return result;
        }
        function verifyTeamsToSkills(actual, expected) {
            chai_1.expect(actual.length, 'The number of skills of a team should be correct').to.be.equal(expected.length);
            var actualOrdered = _.orderBy(actual, function (_) { return _.team.id; });
            var expectedOrdered = _.orderBy(expected, function (_) { return _.team.id; });
            for (var i = 0; i < expected.length; i++) {
                var actualSkillsOfATeam = actualOrdered[i];
                var expectedSkillsOfATeam = expectedOrdered[i];
                chai_1.expect(actualSkillsOfATeam.team.id).to.be.equal(expectedSkillsOfATeam.team.id);
                verifyTeamToSkills(actualSkillsOfATeam.skills, expectedSkillsOfATeam.skills);
            }
        }
        function verifyTeamToSkills(actual, expected) {
            chai_1.expect(actual.length, 'The number of team skills should be correct').to.be.equal(expected.length);
            var actualOrdered = _.orderBy(actual, function (_) { return _.skill.id; });
            var expectedOrdered = _.orderBy(expected, function (_) { return _.skill.id; });
            for (var i = 0; i < expected.length; i++) {
                var actualSkillOfATeam = actualOrdered[i];
                var expectedSkillOfATeam = expectedOrdered[i];
                chai_1.expect(actualSkillOfATeam.skill.id).to.be.equal(expectedSkillOfATeam.skill.id);
                chai_1.expect(actualSkillOfATeam.teamSkill.id).to.be.equal(expectedSkillOfATeam.teamSkill.id);
                chai_1.expect(actualSkillOfATeam.upvotingUserIds.sort(), 'The upvotingUserIds should be correct').to.be.deep.equal(expectedSkillOfATeam.upvotingUserIds.sort());
            }
        }
        it('no teams should return empty mapping', function () {
            var promise = teamsDataHandler_1.TeamsDataHandler.getSkillsOfTeams();
            return chai_1.expect(promise).to.eventually.deep.equal([]);
        });
        it('teams without skills should return correct result', function () {
            var numberOfTeams = 5;
            var teams;
            var expectedTeamsToSkills;
            var addTeamsPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return environmentDirtifier_1.EnvironmentDirtifier.createTeams(numberOfTeams, _users[0].id); })
                .then(function (_teams) {
                teams = _teams;
                expectedTeamsToSkills =
                    _.map(_teams, function (_team) {
                        return {
                            team: _team,
                            skills: []
                        };
                    });
                return _teams;
            });
            var promise = addTeamsPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getSkillsOfTeams(); });
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function (_teamsToSkills) {
                verifyTeamsToSkills(_teamsToSkills, expectedTeamsToSkills);
            });
        });
        it('has teams with skills should return correct result', function () {
            var user;
            var createUsersPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) {
                user = _users[0];
            });
            var numberOfTeams = 3;
            var teams;
            var addTeamsPromise = createUsersPromise.then(function () { return environmentDirtifier_1.EnvironmentDirtifier.createTeams(numberOfTeams, user.id); })
                .then(function (_teams) {
                teams = _teams;
            });
            var numberOfSkills = 4;
            var skills;
            var addSkillsPromise = createUsersPromise
                .then(function () { return environmentDirtifier_1.EnvironmentDirtifier.createSkills(numberOfSkills, user.id); })
                .then(function (_skills) {
                skills = _skills;
            });
            var team1Skills;
            var team2Skills;
            var team3Skills;
            var addTeamSkillsPromise = Promise.all([addTeamsPromise, addSkillsPromise])
                .then(function () { return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(teams[0], skills[0])),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(teams[0], skills[1])),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(teams[1], skills[1])),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(teams[1], skills[2])),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(teams[2], skills[2])),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(teams[2], skills[3]))
            ]); })
                .then(function (_teamSkills) {
                team1Skills = [_teamSkills[0], _teamSkills[1]];
                team2Skills = [_teamSkills[2], _teamSkills[3]];
                team3Skills = [_teamSkills[4], _teamSkills[5]];
            });
            var expectedTeamsToSkills;
            var teamsToSkillsPromise = addTeamSkillsPromise.then(function () {
                var expectedTeam1ToSkills = createTeamToSkills(teams[0], team1Skills, [skills[0], skills[1]]);
                var expectedTeam2ToSkills = createTeamToSkills(teams[1], team2Skills, [skills[1], skills[2]]);
                var expectedTeam3ToSkills = createTeamToSkills(teams[2], team3Skills, [skills[2], skills[3]]);
                expectedTeamsToSkills = [expectedTeam1ToSkills, expectedTeam2ToSkills, expectedTeam3ToSkills];
            });
            var promise = teamsToSkillsPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getSkillsOfTeams(); });
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function (_actualTeamsToSkills) {
                verifyTeamsToSkills(_actualTeamsToSkills, expectedTeamsToSkills);
            });
        });
        it('has teams with skills with upvotes should return correct result', function () {
            var user;
            var createUsersPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) {
                user = _users[0];
            });
            var numberOfTeams = 3;
            var teams;
            var addTeamsPromise = createUsersPromise.then(function () { return environmentDirtifier_1.EnvironmentDirtifier.createTeams(numberOfTeams, user.id); })
                .then(function (_teams) {
                teams = _teams;
            });
            var numberOfSkills = 4;
            var skills;
            var addSkillsPromise = createUsersPromise
                .then(function () { return environmentDirtifier_1.EnvironmentDirtifier.createSkills(numberOfSkills, user.id); })
                .then(function (_skills) {
                skills = _skills;
            });
            var team1Skills;
            var team2Skills;
            var team3Skills;
            var addTeamSkillsPromise = Promise.all([addTeamsPromise, addSkillsPromise])
                .then(function () { return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(teams[0], skills[0])),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(teams[0], skills[1])),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(teams[1], skills[1])),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(teams[1], skills[2])),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(teams[2], skills[2])),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(teams[2], skills[3]))
            ]); })
                .then(function (_teamSkills) {
                team1Skills = [_teamSkills[0], _teamSkills[1]];
                team2Skills = [_teamSkills[2], _teamSkills[3]];
                team3Skills = [_teamSkills[4], _teamSkills[5]];
            });
            var expectedTeamsToSkills;
            var teamsToSkillsPromise = addTeamSkillsPromise.then(function () {
                var expectedTeam1ToSkills = createTeamToSkills(teams[0], team1Skills, [skills[0], skills[1]]);
                var expectedTeam2ToSkills = createTeamToSkills(teams[1], team2Skills, [skills[1], skills[2]]);
                var expectedTeam3ToSkills = createTeamToSkills(teams[2], team3Skills, [skills[2], skills[3]]);
                expectedTeamsToSkills = [expectedTeam1ToSkills, expectedTeam2ToSkills, expectedTeam3ToSkills];
            });
            var user1;
            var user2;
            var upvotingPromise = teamsToSkillsPromise.then(function () {
                return Promise.all([
                    userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(1)),
                    userDataHandler_1.UserDataHandler.createUser(modelInfoMockFactory_1.ModelInfoMockFactory.createUserInfo(2))
                ]);
            }).then(function (_users) {
                user1 = _users[0], user2 = _users[1];
            }).then(function () { return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(expectedTeamsToSkills[0].skills[0].teamSkill.id, user1.id),
                teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(expectedTeamsToSkills[0].skills[0].teamSkill.id, user2.id),
                teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(expectedTeamsToSkills[1].skills[0].teamSkill.id, user1.id),
                teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(expectedTeamsToSkills[2].skills[1].teamSkill.id, user2.id),
            ]); }).then(function () {
                expectedTeamsToSkills[0].skills[0].upvotingUserIds = [user1.id, user2.id];
                expectedTeamsToSkills[1].skills[0].upvotingUserIds = [user1.id];
                expectedTeamsToSkills[2].skills[1].upvotingUserIds = [user2.id];
            });
            var promise = upvotingPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getSkillsOfTeams(); });
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function (_actualTeamsToSkills) {
                verifyTeamsToSkills(_actualTeamsToSkills, expectedTeamsToSkills);
            });
        });
    });
    describe('getNumberOfTeams', function () {
        it('no teams should return 0', function () {
            var resultPromise = teamsDataHandler_1.TeamsDataHandler.getNumberOfTeams();
            return chai_1.expect(resultPromise).to.eventually.equal(0);
        });
        it('has teams should return correct number', function () {
            var numberOfTeams = 12;
            var createTeamsPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return environmentDirtifier_1.EnvironmentDirtifier.createTeams(numberOfTeams, _users[0].id); });
            var resultPromise = createTeamsPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getNumberOfTeams(); });
            return chai_1.expect(resultPromise).to.eventually.equal(numberOfTeams);
        });
    });
    describe('getTeamsCreators', function () {
        var user1;
        var user2;
        beforeEach(function () {
            return environmentDirtifier_1.EnvironmentDirtifier.createUsers(2)
                .then(function (_users) {
                user1 = _users[0], user2 = _users[1];
            });
        });
        it('no teams should return empty', function () {
            var promise = teamsDataHandler_1.TeamsDataHandler.getTeamsCreators();
            return chai_1.expect(promise).to.eventually.deep.equal([]);
        });
        it('teams created should return correct result', function () {
            var teamInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('1');
            var teamInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('2');
            var expected;
            var teamsPromise = bluebirdPromise.all([
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo1, user1.id),
                teamsDataHandler_1.TeamsDataHandler.createTeam(teamInfo2, user2.id)
            ]).then(function (_teams) {
                expected = [
                    {
                        user_id: user1.id,
                        team_id: _teams[0].id
                    },
                    {
                        user_id: user2.id,
                        team_id: _teams[1].id
                    }
                ];
            });
            var promise = teamsPromise.then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeamsCreators(); });
            return chai_1.expect(promise).to.eventually.fulfilled
                .then(function (_creators) {
                return _.map(_creators, function (_) { return _.attributes; });
            })
                .then(function (_creatorsInfos) {
                modelInfoVerificator_1.ModelInfoVerificator.verifyMultipleInfosOrdered(_creatorsInfos, expected, modelInfoComparers_1.ModelInfoComparers.compareTeamsCreators);
            });
        });
    });
    describe('updateTeamName', function () {
        var team;
        var newTeamName;
        beforeEach(function () {
            newTeamName = 'new team name';
            return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1)
                .then(function (_users) { return environmentDirtifier_1.EnvironmentDirtifier.createTeams(1, _users[0].id); })
                .then(function (_teams) {
                team = _teams[0];
            });
        });
        it('should update the team name correctly', function () {
            var updateTeamNamePromise = teamsDataHandler_1.TeamsDataHandler.updateTeamName(team.id, newTeamName);
            return chai_1.expect(updateTeamNamePromise).to.eventually.fulfilled
                .then(function () { return teamsDataHandler_1.TeamsDataHandler.getTeam(team.id); })
                .then(function (_team) {
                chai_1.expect(_team.attributes.name).to.be.equal(newTeamName);
            });
        });
        it('should return correct team details', function () {
            var updateTeamNamePromise = teamsDataHandler_1.TeamsDataHandler.updateTeamName(team.id, newTeamName);
            return chai_1.expect(updateTeamNamePromise).to.eventually.fulfilled
                .then(function (_team) {
                chai_1.expect(_team.id).to.be.equal(team.id);
                chai_1.expect(_team.attributes.name).to.be.equal(newTeamName);
            });
        });
        it('with empty team name should fail', function () {
            var updateTeamNamePromise = teamsDataHandler_1.TeamsDataHandler.updateTeamName(team.id, '');
            return chai_1.expect(updateTeamNamePromise).to.eventually.rejected;
        });
        it('with null team name should fail', function () {
            var updateTeamNamePromise = teamsDataHandler_1.TeamsDataHandler.updateTeamName(team.id, null);
            return chai_1.expect(updateTeamNamePromise).to.eventually.rejected;
        });
    });
});
//# sourceMappingURL=teamsDataHandler.test.js.map