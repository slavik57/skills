"use strict";
var teamsDataHandler_1 = require("../../dataHandlers/teamsDataHandler");
var modelInfoMockFactory_1 = require("../../testUtils/modelInfoMockFactory");
var environmentDirtifier_1 = require("../../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var getTeamsSkillsOperation_1 = require('./getTeamsSkillsOperation');
var _ = require('lodash');
chai.use(chaiAsPromised);
describe('GetTeamSkillsOperation', function () {
    beforeEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    afterEach(function () {
        return environmentCleaner_1.EnvironmentCleaner.clearTables();
    });
    describe('execute', function () {
        var team1;
        var team2;
        var team1Skill1;
        var team1Skill2;
        var team2Skill1;
        var team2Skill2;
        var team1Skill1TeamSkill;
        var team1Skill2TeamSkill;
        var team2Skill1TeamSkill;
        var team2Skill2TeamSkill;
        var user1;
        var user2;
        var user3;
        var team1Skill1UpvotingUserIds;
        var team1Skill2UpvotingUserIds;
        var team2Skill1UpvotingUserIds;
        var team2Skill2UpvotingUserIds;
        var operation;
        beforeEach(function () {
            var createTeamPromise = environmentDirtifier_1.EnvironmentDirtifier.createTeams(2)
                .then(function (_teams) {
                team1 = _teams[0], team2 = _teams[1];
            });
            var createSkillsPromise = environmentDirtifier_1.EnvironmentDirtifier.createSkills(4)
                .then(function (_skills) {
                team1Skill1 = _skills[0], team1Skill2 = _skills[1], team2Skill1 = _skills[2], team2Skill2 = _skills[3];
            });
            var createUsersPromise = environmentDirtifier_1.EnvironmentDirtifier.createUsers(3)
                .then(function (_users) {
                user1 = _users[0], user2 = _users[1], user3 = _users[2];
            });
            return Promise.all([
                createTeamPromise,
                createSkillsPromise,
                createUsersPromise
            ]).then(function () { return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, team1Skill1)),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, team1Skill2)),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team2, team2Skill1)),
                teamsDataHandler_1.TeamsDataHandler.addTeamSkill(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team2, team2Skill2))
            ]); }).then(function (_teamSkills) {
                team1Skill1TeamSkill = _teamSkills[0], team1Skill2TeamSkill = _teamSkills[1], team2Skill1TeamSkill = _teamSkills[2], team2Skill2TeamSkill = _teamSkills[3];
            }).then(function () { return Promise.all([
                teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(team1Skill1TeamSkill.id, user1.id),
                teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(team1Skill1TeamSkill.id, user2.id),
                teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(team1Skill2TeamSkill.id, user1.id),
                teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(team1Skill2TeamSkill.id, user3.id),
                teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(team2Skill1TeamSkill.id, user2.id),
                teamsDataHandler_1.TeamsDataHandler.upvoteTeamSkill(team2Skill1TeamSkill.id, user3.id)
            ]); }).then(function () {
                team1Skill1UpvotingUserIds = [user1.id, user2.id];
                team1Skill2UpvotingUserIds = [user1.id, user3.id];
                team2Skill1UpvotingUserIds = [user2.id, user3.id];
                team2Skill2UpvotingUserIds = [];
                operation = new getTeamsSkillsOperation_1.GetTeamsSkillsOperation();
            });
        });
        function verifySkillsOfTeams(actual, expected) {
            chai_1.expect(actual.length, 'The number of teams skills should be correct').to.be.equal(expected.length);
            var actualOrdered = _.orderBy(actual, function (_) { return _.team.id; });
            var expectedOrdered = _.orderBy(expected, function (_) { return _.team.id; });
            for (var i = 0; i < expected.length; i++) {
                var actualTeamSkills = actualOrdered[i];
                var expectedTeamSkills = expectedOrdered[i];
                chai_1.expect(actualTeamSkills.team.id, 'Should contain team id: ' + expectedTeamSkills.team.id).to.be.equal(expectedTeamSkills.team.id);
                verifySkillsOfTeam(actualTeamSkills.skills, expectedTeamSkills.skills);
            }
        }
        function verifySkillsOfTeam(actual, expected) {
            chai_1.expect(actual.length, 'The number of team skills should be correct').to.be.equal(expected.length);
            var actualOrdered = _.orderBy(actual, function (_) { return _.skill.id; });
            var expectedOrdered = _.orderBy(expected, function (_) { return _.skill.id; });
            for (var i = 0; i < expected.length; i++) {
                var actualTeamSkill = actualOrdered[i];
                var expectedTeamSkill = expectedOrdered[i];
                chai_1.expect(actualTeamSkill.skill.id, 'Should contain skill id: ' + expectedTeamSkill.skill.id).to.be.equal(expectedTeamSkill.skill.id);
                chai_1.expect(actualTeamSkill.teamSkill.id, 'Should contain teamSkill id: ' + expectedTeamSkill.teamSkill.id).to.be.equal(expectedTeamSkill.teamSkill.id);
                chai_1.expect(actualTeamSkill.upvotingUserIds.sort(), 'The upvoting user ids should be correct for skill: ' + expectedTeamSkill.skill.attributes.name).to.deep.equal(expectedTeamSkill.upvotingUserIds.sort());
            }
        }
        it('should return correct result', function () {
            var resultPromise = operation.execute();
            var expectedTeamsSkills = [
                {
                    team: team1,
                    skills: [
                        {
                            skill: team1Skill1,
                            teamSkill: team1Skill1TeamSkill,
                            upvotingUserIds: team1Skill1UpvotingUserIds
                        },
                        {
                            skill: team1Skill2,
                            teamSkill: team1Skill2TeamSkill,
                            upvotingUserIds: team1Skill2UpvotingUserIds
                        }
                    ]
                },
                {
                    team: team2,
                    skills: [
                        {
                            skill: team2Skill1,
                            teamSkill: team2Skill1TeamSkill,
                            upvotingUserIds: team2Skill1UpvotingUserIds
                        },
                        {
                            skill: team2Skill2,
                            teamSkill: team2Skill2TeamSkill,
                            upvotingUserIds: team2Skill2UpvotingUserIds
                        }
                    ]
                }
            ];
            return chai_1.expect(resultPromise).to.eventually.fulfilled
                .then(function (_actualTeamsSkills) {
                verifySkillsOfTeams(_actualTeamsSkills, expectedTeamsSkills);
            });
        });
    });
});
