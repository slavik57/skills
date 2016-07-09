"use strict";
var environmentCleaner_1 = require("../testUtils/environmentCleaner");
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var user_1 = require('./user');
chai.use(chaiAsPromised);
describe('User', function () {
    describe('new', function () {
        var validUserInfo1;
        var validUserInfo2;
        beforeEach(function () {
            validUserInfo1 = {
                username: 'slavik57',
                password_hash: 'some hash',
                email: 's@gmail.com',
                firstName: 'Slava',
                lastName: 'Shp',
            };
            validUserInfo2 = {
                username: 'slavik57_2',
                password_hash: 'some hash 2',
                email: 's2@gmail.com',
                firstName: 'Slava2',
                lastName: 'Shp2',
            };
            return environmentCleaner_1.EnvironmentCleaner.clearTables();
        });
        afterEach(function () {
            environmentCleaner_1.EnvironmentCleaner.clearTables();
        });
        it('create user with empty fields - should return error', function () {
            var user = new user_1.User();
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with missing username - should return error', function () {
            delete validUserInfo1.username;
            var user = new user_1.User(validUserInfo1);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with missing password_hash - should return error', function () {
            delete validUserInfo1.password_hash;
            var user = new user_1.User(validUserInfo1);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with missing email - should succeed', function () {
            delete validUserInfo1.email;
            var user = new user_1.User(validUserInfo1);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.fulfilled;
        });
        it('create user with missing email should be fetched', function () {
            delete validUserInfo1.email;
            var user = new user_1.User(validUserInfo1);
            var promise = user.save();
            var usersPromise = promise.then(function () { return new user_1.Users().fetch(); });
            return chai_1.expect(usersPromise).to.eventually.fulfilled
                .then(function (users) {
                chai_1.expect(users.size()).to.be.equal(1);
            });
        });
        it('create user with null email - should succeed', function () {
            validUserInfo1.email = null;
            var user = new user_1.User(validUserInfo1);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.fulfilled;
        });
        it('create user with null email should be fetched', function () {
            validUserInfo1.email = null;
            var user = new user_1.User(validUserInfo1);
            var promise = user.save();
            var usersPromise = promise.then(function () { return new user_1.Users().fetch(); });
            return chai_1.expect(usersPromise).to.eventually.fulfilled
                .then(function (users) {
                chai_1.expect(users.size()).to.be.equal(1);
            });
        });
        it('create user with missing firstName - should return error', function () {
            delete validUserInfo1.firstName;
            var user = new user_1.User(validUserInfo1);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with missing lastName should return error', function () {
            delete validUserInfo1.lastName;
            var user = new user_1.User(validUserInfo1);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with existing username should return error', function () {
            var user1 = new user_1.User(validUserInfo1);
            validUserInfo2.username = validUserInfo1.username;
            var user2 = new user_1.User(validUserInfo2);
            var promise = user1.save().then(function () { return user2.save(); }, function () { chai_1.expect(true).to.be.false; });
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with existing email should return error', function () {
            var user1 = new user_1.User(validUserInfo1);
            validUserInfo2.email = validUserInfo1.email;
            var user2 = new user_1.User(validUserInfo2);
            var promise = user1.save().then(function () { return user2.save(); }, function () { chai_1.expect(true).to.be.false; });
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with existing firstName and lastName should succeed', function () {
            var user1 = new user_1.User(validUserInfo1);
            validUserInfo2.firstName = validUserInfo1.firstName;
            validUserInfo2.lastName = validUserInfo1.lastName;
            var user2 = new user_1.User(validUserInfo2);
            var promise = user1.save().then(function () { return user2.save(); }, function () { chai_1.expect(true).to.be.false; });
            return chai_1.expect(promise).to.eventually.equal(user2);
        });
        it('create user with existing firstName but different lastName should succeed', function () {
            var user1 = new user_1.User(validUserInfo1);
            validUserInfo2.firstName = validUserInfo1.firstName;
            var user2 = new user_1.User(validUserInfo2);
            var promise = user1.save().then(function () { return user2.save(); }, function () { chai_1.expect(true).to.be.false; });
            return chai_1.expect(promise).to.eventually.equal(user2);
        });
        it('create user with existing lastName but different firstName should succeed', function () {
            var user1 = new user_1.User(validUserInfo1);
            validUserInfo2.lastName = validUserInfo1.lastName;
            var user2 = new user_1.User(validUserInfo2);
            var promise = user1.save().then(function () { return user2.save(); }, function () { chai_1.expect(true).to.be.false; });
            return chai_1.expect(promise).to.eventually.equal(user2);
        });
        it('create user with empty username should return error', function () {
            validUserInfo1.username = '';
            var user = new user_1.User(validUserInfo1);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with empty password_hash should return error', function () {
            validUserInfo1.password_hash = '';
            var user = new user_1.User(validUserInfo1);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with empty email should return error', function () {
            validUserInfo1.email = '';
            var user = new user_1.User(validUserInfo1);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with empty firstName should return error', function () {
            validUserInfo1.firstName = '';
            var user = new user_1.User(validUserInfo1);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with empty lastName should return error', function () {
            validUserInfo1.lastName = '';
            var user = new user_1.User(validUserInfo1);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with everything ok should save user correctly', function () {
            var user = new user_1.User(validUserInfo1);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.equal(user);
        });
        it('create user with invalid email should return error', function () {
            validUserInfo1.email = 'ssssss';
            var user = new user_1.User(validUserInfo1);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with everything ok should be fetched', function () {
            var user = new user_1.User(validUserInfo1);
            var promise = user.save();
            var usersPromise = promise.then(function () { return new user_1.Users().fetch(); });
            return chai_1.expect(usersPromise).to.eventually.fulfilled
                .then(function (users) {
                chai_1.expect(users.size()).to.be.equal(1);
            });
        });
    });
});
describe('Users', function () {
    describe('clearAll', function () {
        it('should clear all the users', function () {
            var promise = user_1.Users.clearAll();
            var usersPromise = promise.then(function () { return new user_1.Users().fetch(); });
            return chai_1.expect(usersPromise).to.eventually.fulfilled
                .then(function (users) {
                chai_1.expect(users.size()).to.be.equal(0);
            });
        });
        it('should not fail on empty table', function () {
            var promise = user_1.Users.clearAll().then(function () { return user_1.Users.clearAll(); });
            var usersPromise = promise.then(function () { return new user_1.Users().fetch(); });
            return chai_1.expect(usersPromise).to.eventually.fulfilled;
        });
    });
});
//# sourceMappingURL=user.test.js.map