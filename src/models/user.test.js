"use strict";
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var user_1 = require('./user');
var user_2 = require('../testUtils/modelsUtils/user');
chai.use(chaiAsPromised);
describe('User', function () {
    describe('new', function () {
        var validUserInfo;
        beforeEach(function (done) {
            user_2.TestUtils.clearUsersTable(done);
            validUserInfo = {
                username: 'slavik57',
                password_hash: 'some hash',
                email: 's@gmail.com',
                firstName: 'Slava',
                lastName: 'Shp',
            };
        });
        afterEach(function (done) {
            user_2.TestUtils.clearUsersTable(done);
        });
        it('create user with empty fields - should return error', function () {
            var user = new user_1.User();
            var promise = user.save();
            return chai_1.expect(promise).to.be.rejected;
        });
        it('create user with missing username - should return error', function () {
            delete validUserInfo.username;
            var user = new user_1.User(validUserInfo);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with missing password_hash - should return error', function () {
            delete validUserInfo.password_hash;
            var user = new user_1.User(validUserInfo);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with missing email - should return error', function () {
            delete validUserInfo.email;
            var user = new user_1.User(validUserInfo);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with missing firstName - should return error', function () {
            delete validUserInfo.firstName;
            var user = new user_1.User(validUserInfo);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with missing lastName should return error', function () {
            delete validUserInfo.lastName;
            var user = new user_1.User(validUserInfo);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with invalid email should return error', function () {
            validUserInfo.email = 'ssssss';
            var user = new user_1.User(validUserInfo);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with empty email should return error', function () {
            validUserInfo.email = '';
            var user = new user_1.User(validUserInfo);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create user with everything ok should save user correctly', function () {
            var user = new user_1.User(validUserInfo);
            var promise = user.save();
            return chai_1.expect(promise).to.eventually.equal(user);
        });
    });
});
