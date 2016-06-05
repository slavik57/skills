"use strict";
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var team_1 = require('./team');
chai.use(chaiAsPromised);
describe('Team', function () {
    describe('new', function () {
        var validTeamInfo;
        var validTeamInfo2;
        beforeEach(function () {
            validTeamInfo = {
                name: 'team name 1'
            };
            validTeamInfo2 = {
                name: 'team name 2'
            };
            return team_1.Teams.clearAll();
        });
        afterEach(function () {
            return team_1.Teams.clearAll();
        });
        it('create team with empty fields - should return error', function () {
            var skill = new team_1.Team();
            var promise = skill.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create team with missing name - should return error', function () {
            delete validTeamInfo.name;
            var skill = new team_1.Team(validTeamInfo);
            var promise = skill.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create team with existing name should return error', function () {
            var team1 = new team_1.Team(validTeamInfo);
            validTeamInfo2.name = validTeamInfo.name;
            var team2 = new team_1.Team(validTeamInfo2);
            var promise = team1.save().then(function () { return team2.save(); }, function () { chai_1.expect(true).to.be.false; });
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create team with empty name should return error', function () {
            validTeamInfo.name = '';
            var team = new team_1.Team(validTeamInfo);
            var promise = team.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create team with everything ok should save team correctly', function () {
            var team = new team_1.Team(validTeamInfo);
            var promise = team.save();
            return chai_1.expect(promise).to.eventually.equal(team);
        });
        it('create team with everything ok should be fetched', function () {
            var team = new team_1.Team(validTeamInfo);
            var promise = team.save();
            var teamsPromise = promise.then(function () { return new team_1.Teams().fetch(); });
            return chai_1.expect(teamsPromise).to.eventually.fulfilled
                .then(function (teams) {
                chai_1.expect(teams.size()).to.be.equal(1);
                chai_1.expect(teams.at(0).attributes.name).to.be.equal(validTeamInfo.name);
            });
        });
    });
});
describe('Teams', function () {
    describe('clearAll', function () {
        it('should clear all the teams', function () {
            var promise = team_1.Teams.clearAll();
            var teamsPromise = promise.then(function () { return new team_1.Teams().fetch(); });
            return chai_1.expect(teamsPromise).to.eventually.fulfilled
                .then(function (teams) {
                chai_1.expect(teams.size()).to.be.equal(0);
            });
        });
        it('should not fail on empty table', function () {
            var promise = team_1.Teams.clearAll().then(function () { return team_1.Teams.clearAll(); });
            var usersPromise = promise.then(function () { return new team_1.Teams().fetch(); });
            return chai_1.expect(usersPromise).to.eventually.fulfilled;
        });
    });
});
