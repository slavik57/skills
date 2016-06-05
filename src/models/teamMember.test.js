"use strict";
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var team_1 = require('./team');
var user_1 = require('./user');
var teamMember_1 = require('./teamMember');
chai.use(chaiAsPromised);
describe('TeamMember', function () {
    describe('new', function () {
        var user1;
        var user2;
        var team1;
        function clearTables() {
            return teamMember_1.TeamMembers.clearAll()
                .then(function () { return Promise.all([
                user_1.Users.clearAll(),
                team_1.Teams.clearAll()
            ]); });
        }
        function createUserInfo(userNumber) {
            return {
                username: 'username' + userNumber,
                password_hash: 'password' + userNumber,
                email: 'someMail' + userNumber + '@gmail.com',
                firstName: 'first name' + userNumber,
                lastName: 'last name' + userNumber
            };
        }
        function createTeamInfo(teamName) {
            return {
                name: teamName
            };
        }
        function createTeamMemberInfo(team, user) {
            return {
                team_id: team.id,
                user_id: user.id,
                is_admin: false
            };
        }
        beforeEach(function () {
            return clearTables()
                .then(function () { return Promise.all([
                new user_1.User(createUserInfo(1)).save(),
                new user_1.User(createUserInfo(2)).save(),
                new team_1.Team(createTeamInfo('a')).save(),
            ]); })
                .then(function (usersAndTeams) {
                user1 = usersAndTeams[0];
                user2 = usersAndTeams[1];
                team1 = usersAndTeams[2];
            });
        });
        afterEach(function () {
            return clearTables();
        });
        it('create without any fields should return error', function () {
            var teamMember = new teamMember_1.TeamMember();
            var promise = teamMember.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create without team_id should return error', function () {
            var teamMemberInfo = createTeamMemberInfo(team1, user1);
            delete teamMemberInfo.team_id;
            var teamMember = new teamMember_1.TeamMember(teamMemberInfo);
            var promise = teamMember.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create without user_id should return error', function () {
            var teamMemberInfo = createTeamMemberInfo(team1, user1);
            delete teamMemberInfo.user_id;
            var teamMember = new teamMember_1.TeamMember(teamMemberInfo);
            var promise = teamMember.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create without is_admin should succeed', function () {
            var teamMemberInfo = createTeamMemberInfo(team1, user1);
            delete teamMemberInfo.is_admin;
            var teamMember = new teamMember_1.TeamMember(teamMemberInfo);
            var promise = teamMember.save();
            return chai_1.expect(promise).to.eventually.equal(teamMember);
        });
        it('create with non integer team_id should return error', function () {
            var teamMemberInfo = createTeamMemberInfo(team1, user1);
            teamMemberInfo.team_id = 1.1;
            var teamMember = new teamMember_1.TeamMember(teamMemberInfo);
            var promise = teamMember.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non integer user_id should return error', function () {
            var teamMemberInfo = createTeamMemberInfo(team1, user1);
            teamMemberInfo.user_id = 1.1;
            var teamMember = new teamMember_1.TeamMember(teamMemberInfo);
            var promise = teamMember.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non existing team_id should return error', function () {
            var teamMemberInfo = createTeamMemberInfo(team1, user1);
            teamMemberInfo.team_id = team1.id + 1;
            var teamMember = new teamMember_1.TeamMember(teamMemberInfo);
            var promise = teamMember.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with non existing user_id name should return error', function () {
            var teamMemberInfo = createTeamMemberInfo(team1, user1);
            teamMemberInfo.user_id = user1.id + user2.id + 1;
            var teamMember = new teamMember_1.TeamMember(teamMemberInfo);
            var promise = teamMember.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create with existing team_id and user_id should succeed', function () {
            var teamMemberInfo = createTeamMemberInfo(team1, user1);
            var teamMember = new teamMember_1.TeamMember(teamMemberInfo);
            var promise = teamMember.save();
            return chai_1.expect(promise).to.eventually.equal(teamMember);
        });
        it('create with existing team_id and user_id should be fetched', function () {
            var teamMemberInfo = createTeamMemberInfo(team1, user1);
            var teamMember = new teamMember_1.TeamMember(teamMemberInfo);
            var promise = teamMember.save();
            var teamMembersPromise = promise.then(function () { return new teamMember_1.TeamMembers().fetch(); });
            return chai_1.expect(teamMembersPromise).to.eventually.fulfilled
                .then(function (teamMembers) {
                var teamMember = teamMembers.at(0);
                chai_1.expect(teamMembers.size()).to.be.equal(1);
                chai_1.expect(teamMember.attributes.team_id).to.be.equal(teamMemberInfo.team_id);
                chai_1.expect(teamMember.attributes.user_id).to.be.equal(teamMemberInfo.user_id);
                chai_1.expect(teamMember.attributes.is_admin).to.be.equal(teamMemberInfo.is_admin);
            });
        });
        it('create with is_admin false should be fetched correctly', function () {
            var teamMemberInfo = createTeamMemberInfo(team1, user1);
            teamMemberInfo.is_admin = false;
            var teamMember = new teamMember_1.TeamMember(teamMemberInfo);
            var promise = teamMember.save();
            var teamMembersPromise = promise.then(function () { return new teamMember_1.TeamMembers().fetch(); });
            return chai_1.expect(teamMembersPromise).to.eventually.fulfilled
                .then(function (teamMembers) {
                var teamMember = teamMembers.at(0);
                chai_1.expect(teamMembers.size()).to.be.equal(1);
                chai_1.expect(teamMember.attributes.team_id).to.be.equal(teamMemberInfo.team_id);
                chai_1.expect(teamMember.attributes.user_id).to.be.equal(teamMemberInfo.user_id);
                chai_1.expect(teamMember.attributes.is_admin).to.be.false;
            });
        });
        it('create with is_admin true should be fetched correctly', function () {
            var teamMemberInfo = createTeamMemberInfo(team1, user1);
            teamMemberInfo.is_admin = true;
            var teamMember = new teamMember_1.TeamMember(teamMemberInfo);
            var promise = teamMember.save();
            var teamMembersPromise = promise.then(function () { return new teamMember_1.TeamMembers().fetch(); });
            return chai_1.expect(teamMembersPromise).to.eventually.fulfilled
                .then(function (teamMembers) {
                var teamMember = teamMembers.at(0);
                chai_1.expect(teamMembers.size()).to.be.equal(1);
                chai_1.expect(teamMember.attributes.team_id).to.be.equal(teamMemberInfo.team_id);
                chai_1.expect(teamMember.attributes.user_id).to.be.equal(teamMemberInfo.user_id);
                chai_1.expect(teamMember.attributes.is_admin).to.be.true;
            });
        });
        it('create without is_admin should be fetched correctly', function () {
            var teamMemberInfo = createTeamMemberInfo(team1, user1);
            delete teamMemberInfo.is_admin;
            var teamMember = new teamMember_1.TeamMember(teamMemberInfo);
            var promise = teamMember.save();
            var teamMembersPromise = promise.then(function () { return new teamMember_1.TeamMembers().fetch(); });
            return chai_1.expect(teamMembersPromise).to.eventually.fulfilled
                .then(function (teamMembers) {
                var teamMember = teamMembers.at(0);
                chai_1.expect(teamMembers.size()).to.be.equal(1);
                chai_1.expect(teamMember.attributes.team_id).to.be.equal(teamMemberInfo.team_id);
                chai_1.expect(teamMember.attributes.user_id).to.be.equal(teamMemberInfo.user_id);
                chai_1.expect(teamMember.attributes.is_admin).to.be.false;
            });
        });
        it('create 2 different team members should succeed', function () {
            var teamMemberInfo1 = createTeamMemberInfo(team1, user1);
            var teamMemberInfo2 = createTeamMemberInfo(team1, user2);
            var teamMember1 = new teamMember_1.TeamMember(teamMemberInfo1);
            var teamMember2 = new teamMember_1.TeamMember(teamMemberInfo2);
            var promise = teamMember1.save()
                .then(function () { return teamMember2.save(); });
            return chai_1.expect(promise).to.eventually.equal(teamMember2);
        });
        it('create 2 different team members should be fetched', function () {
            var teamMemberInfo1 = createTeamMemberInfo(team1, user1);
            var teamMemberInfo2 = createTeamMemberInfo(team1, user2);
            var teamMember1 = new teamMember_1.TeamMember(teamMemberInfo1);
            var teamMember2 = new teamMember_1.TeamMember(teamMemberInfo2);
            var promise = teamMember1.save()
                .then(function () { return teamMember2.save(); });
            var teamMembersPromise = promise.then(function () { return new teamMember_1.TeamMembers().fetch(); });
            return chai_1.expect(teamMembersPromise).to.eventually.fulfilled
                .then(function (teamMembers) {
                chai_1.expect(teamMembers.size()).to.be.equal(2);
            });
        });
        it('create 2 same prerequisites should return error', function () {
            var teamMemberInfo1 = createTeamMemberInfo(team1, user1);
            var teamMemberInfo2 = createTeamMemberInfo(team1, user1);
            var teamMember1 = new teamMember_1.TeamMember(teamMemberInfo1);
            var teamMember2 = new teamMember_1.TeamMember(teamMemberInfo2);
            var promise = teamMember1.save()
                .then(function () { return teamMember2.save(); });
            return chai_1.expect(promise).to.eventually.rejected;
        });
    });
});
describe('TeamMembers', function () {
    describe('clearAll', function () {
        it('should clear all the team members', function () {
            var promise = teamMember_1.TeamMembers.clearAll();
            var teamMembersPromise = promise.then(function () { return new teamMember_1.TeamMembers().fetch(); });
            return chai_1.expect(teamMembersPromise).to.eventually.fulfilled
                .then(function (teamMembers) {
                chai_1.expect(teamMembers.size()).to.be.equal(0);
            });
        });
        it('should not fail on empty table', function () {
            var promise = teamMember_1.TeamMembers.clearAll().then(function () { return teamMember_1.TeamMembers.clearAll(); });
            var teamMembersPromise = promise.then(function () { return new teamMember_1.TeamMembers().fetch(); });
            return chai_1.expect(teamMembersPromise).to.eventually.fulfilled;
        });
    });
});
