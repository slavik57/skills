"use strict";
var modelInfoMockFactory_1 = require("../testUtils/modelInfoMockFactory");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var team_1 = require('./team');
var skill_1 = require('./skill');
var teamSkill_1 = require('./teamSkill');
chai.use(chaiAsPromised);
describe('TeamSkill', function () {
    describe('new', function () {
        var skill1;
        var skill2;
        var team1;
        function clearTables() {
            return teamSkill_1.TeamSkills.clearAll()
                .then(function () { return Promise.all([
                skill_1.Skills.clearAll(),
                team_1.Teams.clearAll()
            ]); });
        }
        beforeEach(function () {
            return clearTables()
                .then(function () { return Promise.all([
                new skill_1.Skill(modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill1')).save(),
                new skill_1.Skill(modelInfoMockFactory_1.ModelInfoMockFactory.createSkillInfo('skill2')).save(),
                new team_1.Team(modelInfoMockFactory_1.ModelInfoMockFactory.createTeamInfo('a')).save(),
            ]); })
                .then(function (skillsAndTeams) {
                skill1 = skillsAndTeams[0];
                skill2 = skillsAndTeams[1];
                team1 = skillsAndTeams[2];
            });
        });
        afterEach(function () {
            return clearTables();
        });
        it('create without any fields should return error', function () {
            var teamSkill = new teamSkill_1.TeamSkill();
            var promise = teamSkill.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create without team_id should return error', function () {
            var teamSkillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            delete teamSkillInfo.team_id;
            var teamSkill = new teamSkill_1.TeamSkill(teamSkillInfo);
            var promise = teamSkill.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create without skill_id should return error', function () {
            var teamSkillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            delete teamSkillInfo.skill_id;
            var teamSkill = new teamSkill_1.TeamSkill(teamSkillInfo);
            var promise = teamSkill.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non integer team_id should return error', function () {
            var teamSkillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            teamSkillInfo.team_id = 1.1;
            var teamMember = new teamSkill_1.TeamSkill(teamSkillInfo);
            var promise = teamMember.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non integer skill_id should return error', function () {
            var teamMemberInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            teamMemberInfo.skill_id = 1.1;
            var teamSkill = new teamSkill_1.TeamSkill(teamMemberInfo);
            var promise = teamSkill.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non existing team_id should return error', function () {
            var teamSkillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            teamSkillInfo.team_id = team1.id + 1;
            var teamSkill = new teamSkill_1.TeamSkill(teamSkillInfo);
            var promise = teamSkill.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non existing skill_id name should return error', function () {
            var teamSkillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            teamSkillInfo.skill_id = skill1.id + skill2.id + 1;
            var teamSkill = new teamSkill_1.TeamSkill(teamSkillInfo);
            var promise = teamSkill.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with existing team_id and skill_id should succeed', function () {
            var teamSkillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var teamSkill = new teamSkill_1.TeamSkill(teamSkillInfo);
            var promise = teamSkill.save();
            return chai_1.expect(promise).to.eventually.equal(teamSkill);
        });
        it('create with existing team_id and skill_id should be fetched', function () {
            var teamSkillInfo = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var teamSkill = new teamSkill_1.TeamSkill(teamSkillInfo);
            var promise = teamSkill.save();
            var teamSkillsPromise = promise.then(function () { return new teamSkill_1.TeamSkills().fetch(); });
            return chai_1.expect(teamSkillsPromise).to.eventually.fulfilled
                .then(function (teamSkills) {
                var teamSkill = teamSkills.at(0);
                chai_1.expect(teamSkills.size()).to.be.equal(1);
                chai_1.expect(teamSkill.attributes.team_id).to.be.equal(teamSkillInfo.team_id);
                chai_1.expect(teamSkill.attributes.skill_id).to.be.equal(teamSkillInfo.skill_id);
            });
        });
        it('create 2 different team skills should succeed', function () {
            var teamSkillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill2);
            var teamSkill1 = new teamSkill_1.TeamSkill(teamSkillInfo1);
            var teamSkill2 = new teamSkill_1.TeamSkill(teamSkillInfo2);
            var promise = teamSkill1.save()
                .then(function () { return teamSkill2.save(); });
            return chai_1.expect(promise).to.eventually.equal(teamSkill2);
        });
        it('create 2 different team skills should be fetched', function () {
            var teamSkillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill2);
            var teamSkill1 = new teamSkill_1.TeamSkill(teamSkillInfo1);
            var teamSkill2 = new teamSkill_1.TeamSkill(teamSkillInfo2);
            var promise = teamSkill1.save()
                .then(function () { return teamSkill2.save(); });
            var teamSkillsPromise = promise.then(function () { return new teamSkill_1.TeamSkills().fetch(); });
            return chai_1.expect(teamSkillsPromise).to.eventually.fulfilled
                .then(function (teamSkills) {
                chai_1.expect(teamSkills.size()).to.be.equal(2);
            });
        });
        it('create 2 same skills should return error', function () {
            var teamSkillInfo1 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var teamSkillInfo2 = modelInfoMockFactory_1.ModelInfoMockFactory.createTeamSkillInfo(team1, skill1);
            var teamSkill1 = new teamSkill_1.TeamSkill(teamSkillInfo1);
            var teamSkill2 = new teamSkill_1.TeamSkill(teamSkillInfo2);
            var promise = teamSkill1.save()
                .then(function () { return teamSkill2.save(); });
            return chai_1.expect(promise).to.eventually.rejected;
        });
    });
});
describe('TeamSkills', function () {
    describe('clearAll', function () {
        it('should clear all the team skills', function () {
            var promise = teamSkill_1.TeamSkills.clearAll();
            var teamSkillsPromise = promise.then(function () { return new teamSkill_1.TeamSkills().fetch(); });
            return chai_1.expect(teamSkillsPromise).to.eventually.fulfilled
                .then(function (teamSkills) {
                chai_1.expect(teamSkills.size()).to.be.equal(0);
            });
        });
        it('should not fail on empty table', function () {
            var promise = teamSkill_1.TeamSkills.clearAll().then(function () { return teamSkill_1.TeamSkills.clearAll(); });
            var teamSkillsPromise = promise.then(function () { return new teamSkill_1.TeamSkills().fetch(); });
            return chai_1.expect(teamSkillsPromise).to.eventually.fulfilled;
        });
    });
});
