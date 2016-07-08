"use strict";
var environmentDirtifier_1 = require("../testUtils/environmentDirtifier");
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var team_1 = require('./team');
var teamCreator_1 = require('./teamCreator');
chai.use(chaiAsPromised);
describe('TeamCreator', function () {
    describe('new', function () {
        var team;
        var user;
        var otherTeam;
        var teamCreatorInfo;
        beforeEach(function () {
            var teamInfo1 = {
                name: 'team name 1'
            };
            var teamInfo2 = {
                name: 'team name 2'
            };
            return environmentCleaner_1.EnvironmentCleaner.clearTables()
                .then(function () { return environmentDirtifier_1.EnvironmentDirtifier.createUsers(1); })
                .then(function (_users) {
                user = _users[0];
            })
                .then(function () { return Promise.all([
                new team_1.Team(teamInfo1).save(),
                new team_1.Team(teamInfo2).save()
            ]); })
                .then(function (_teams) {
                team = _teams[0], otherTeam = _teams[1];
                teamCreatorInfo = {
                    user_id: user.id,
                    team_id: team.id
                };
            });
        });
        afterEach(function () {
            return environmentCleaner_1.EnvironmentCleaner.clearTables();
        });
        it('create without any fields should return error', function () {
            var creator = new teamCreator_1.TeamCreator();
            var promise = creator.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create without team_id should return error', function () {
            delete teamCreatorInfo.team_id;
            var creator = new teamCreator_1.TeamCreator(teamCreatorInfo);
            var promise = creator.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create without user_id should return error', function () {
            delete teamCreatorInfo.user_id;
            var prerequisite = new teamCreator_1.TeamCreator(teamCreatorInfo);
            var creator = prerequisite.save();
            return chai_1.expect(creator).to.eventually.rejected;
        });
        it('create with non integer team_id should return error', function () {
            teamCreatorInfo.team_id = 1.1;
            var creator = new teamCreator_1.TeamCreator(teamCreatorInfo);
            var promise = creator.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non integer user_id should return error', function () {
            teamCreatorInfo.user_id = 1.1;
            var creator = new teamCreator_1.TeamCreator(teamCreatorInfo);
            var promise = creator.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non existing team_id should return error', function () {
            teamCreatorInfo.team_id = team.id + otherTeam.id + 1;
            var creator = new teamCreator_1.TeamCreator(teamCreatorInfo);
            var promise = creator.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non existing user_id should return error', function () {
            teamCreatorInfo.user_id = user.id + 1;
            var creator = new teamCreator_1.TeamCreator(teamCreatorInfo);
            var promise = creator.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with existing team_id and user_id should succeed', function () {
            var creator = new teamCreator_1.TeamCreator(teamCreatorInfo);
            var promise = creator.save();
            return chai_1.expect(promise).to.eventually.equal(creator);
        });
        it('create with existing team_id and user_id should be fetched', function () {
            var creator = new teamCreator_1.TeamCreator(teamCreatorInfo);
            var promise = creator.save();
            var creatorsPromise = promise.then(function () { return new teamCreator_1.TeamCreators().fetch(); });
            return chai_1.expect(creatorsPromise).to.eventually.fulfilled
                .then(function (_creatorsCollection) {
                chai_1.expect(_creatorsCollection.size()).to.be.equal(1);
                chai_1.expect(_creatorsCollection.at(0).attributes.team_id).to.be.equal(teamCreatorInfo.team_id);
                chai_1.expect(_creatorsCollection.at(0).attributes.user_id).to.be.equal(teamCreatorInfo.user_id);
            });
        });
        it('create 2 different teams with same creator should succeed', function () {
            var creatorInfo1 = {
                team_id: team.id,
                user_id: user.id
            };
            var creatorInfo2 = {
                team_id: otherTeam.id,
                user_id: user.id
            };
            var creator1 = new teamCreator_1.TeamCreator(creatorInfo1);
            var creator2 = new teamCreator_1.TeamCreator(creatorInfo2);
            var promise = creator1.save()
                .then(function () { return creator2.save(); });
            return chai_1.expect(promise).to.eventually.equal(creator2);
        });
        it('create 2 different teams with same creator should be fetched', function () {
            var creatorInfo1 = {
                team_id: team.id,
                user_id: user.id
            };
            var creatorInfo2 = {
                team_id: otherTeam.id,
                user_id: user.id
            };
            var creator1 = new teamCreator_1.TeamCreator(creatorInfo1);
            var creator2 = new teamCreator_1.TeamCreator(creatorInfo2);
            var promise = creator1.save()
                .then(function () { return creator2.save(); });
            var creatorsPromise = promise.then(function () { return new teamCreator_1.TeamCreators().fetch(); });
            return chai_1.expect(creatorsPromise).to.eventually.fulfilled
                .then(function (_creators) {
                chai_1.expect(_creators.size()).to.be.equal(2);
            });
        });
        it('create 2 creators with same team should return error', function () {
            var creatorInfo1 = {
                team_id: team.id,
                user_id: user.id
            };
            var creatorInfo2 = {
                team_id: creatorInfo1.team_id,
                user_id: creatorInfo1.user_id
            };
            var creator1 = new teamCreator_1.TeamCreator(creatorInfo1);
            var creator2 = new teamCreator_1.TeamCreator(creatorInfo2);
            var promise = creator1.save()
                .then(function () { return creator2.save(); });
            return chai_1.expect(promise).to.eventually.rejected;
        });
    });
});
describe('TeamCreators', function () {
    describe('clearAll', function () {
        it('should clear all the creators', function () {
            var promise = teamCreator_1.TeamCreators.clearAll();
            var creatorsPromise = promise.then(function () { return new teamCreator_1.TeamCreators().fetch(); });
            return chai_1.expect(creatorsPromise).to.eventually.fulfilled
                .then(function (_creators) {
                chai_1.expect(_creators.size()).to.be.equal(0);
            });
        });
        it('should not fail on empty table', function () {
            var promise = teamCreator_1.TeamCreators.clearAll().then(function () { return teamCreator_1.TeamCreators.clearAll(); });
            var creatorsPromise = promise.then(function () { return new teamCreator_1.TeamCreators().fetch(); });
            return chai_1.expect(creatorsPromise).to.eventually.fulfilled;
        });
    });
});
//# sourceMappingURL=teamCreator.test.js.map