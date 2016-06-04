"use strict";
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
var user_1 = require('./user');
var usersGlobalPermissions_1 = require('./usersGlobalPermissions');
chai.use(chaiAsPromised);
describe('UserGlobalPermissions', function () {
    describe('new', function () {
        var validUserInfo;
        var validUserGlobalPermissions;
        function clearTables() {
            return usersGlobalPermissions_1.UsersGlobalPermissions.clearAll()
                .then(function () { return user_1.Users.clearAll(); });
        }
        beforeEach(function () {
            validUserInfo = {
                username: 'slavik57',
                password_hash: 'some hash',
                email: 's@gmail.com',
                firstName: 'Slava',
                lastName: 'Shp'
            };
            return clearTables()
                .then(function () { return new user_1.User(validUserInfo).save(); })
                .then(function (user) {
                validUserGlobalPermissions = {
                    user_id: user.id,
                    global_permissions: usersGlobalPermissions_1.GlobalPermission[usersGlobalPermissions_1.GlobalPermission.ADMIN]
                };
            });
        });
        afterEach(function () {
            return clearTables();
        });
        it('create without any fields should return error', function () {
            var permissions = new usersGlobalPermissions_1.UserGlobalPermissions();
            var promise = permissions.save();
            return chai_1.expect(promise).to.be.rejected;
        });
        it('create without user_id should return error', function () {
            delete validUserGlobalPermissions.user_id;
            var permissions = new usersGlobalPermissions_1.UserGlobalPermissions(validUserGlobalPermissions);
            var promise = permissions.save();
            return chai_1.expect(promise).to.be.rejected;
        });
        it('create without global_permissions should return error', function () {
            delete validUserGlobalPermissions.global_permissions;
            var permissions = new usersGlobalPermissions_1.UserGlobalPermissions(validUserGlobalPermissions);
            var promise = permissions.save();
            return chai_1.expect(promise).to.be.rejected;
        });
        it('create with non integer user_id should return error', function () {
            validUserGlobalPermissions.user_id = 1.2;
            var permissions = new usersGlobalPermissions_1.UserGlobalPermissions(validUserGlobalPermissions);
            var promise = permissions.save();
            return chai_1.expect(promise).to.be.rejected;
        });
        it('create with non existing user_id should return error', function () {
            validUserGlobalPermissions.user_id = validUserGlobalPermissions.user_id + 1;
            var permissions = new usersGlobalPermissions_1.UserGlobalPermissions(validUserGlobalPermissions);
            var promise = permissions.save();
            return chai_1.expect(promise).to.be.rejected;
        });
        it('create with existing user_id should succeed', function () {
            var permissions = new usersGlobalPermissions_1.UserGlobalPermissions(validUserGlobalPermissions);
            var promise = permissions.save();
            return chai_1.expect(promise).to.eventually.equal(permissions);
        });
        it('create with existing user_id should be fetched', function () {
            var permissions = new usersGlobalPermissions_1.UserGlobalPermissions(validUserGlobalPermissions);
            var promise = permissions.save();
            var permissionsPromise = promise.then(function () { return new usersGlobalPermissions_1.UsersGlobalPermissions().fetch(); });
            return chai_1.expect(permissionsPromise).to.eventually.fulfilled
                .then(function (usersPermissions) {
                chai_1.expect(usersPermissions.size()).to.be.equal(1);
            });
        });
        it('create 2 different permissions with existing user_id should succeed', function () {
            validUserGlobalPermissions.global_permissions = usersGlobalPermissions_1.GlobalPermission[usersGlobalPermissions_1.GlobalPermission.ADMIN];
            var otherUserGlobalPermissions = {
                user_id: validUserGlobalPermissions.user_id,
                global_permissions: usersGlobalPermissions_1.GlobalPermission[usersGlobalPermissions_1.GlobalPermission.READER]
            };
            var permissions = new usersGlobalPermissions_1.UserGlobalPermissions(validUserGlobalPermissions);
            var otherPermissions = new usersGlobalPermissions_1.UserGlobalPermissions(otherUserGlobalPermissions);
            var promise = permissions.save()
                .then(function () { return otherPermissions.save(); });
            return chai_1.expect(promise).to.eventually.equal(otherPermissions);
        });
        it('create 2 different permissions with existing user_id should be fetched', function () {
            validUserGlobalPermissions.global_permissions = usersGlobalPermissions_1.GlobalPermission[usersGlobalPermissions_1.GlobalPermission.ADMIN];
            var otherUserGlobalPermissions = {
                user_id: validUserGlobalPermissions.user_id,
                global_permissions: usersGlobalPermissions_1.GlobalPermission[usersGlobalPermissions_1.GlobalPermission.READER]
            };
            var permissions = new usersGlobalPermissions_1.UserGlobalPermissions(validUserGlobalPermissions);
            var otherPermissions = new usersGlobalPermissions_1.UserGlobalPermissions(otherUserGlobalPermissions);
            var promise = permissions.save()
                .then(function () { return otherPermissions.save(); });
            var permissionsPromise = promise.then(function () { return new usersGlobalPermissions_1.UsersGlobalPermissions().fetch(); });
            return chai_1.expect(permissionsPromise).to.eventually.fulfilled
                .then(function (usersPermissions) {
                chai_1.expect(usersPermissions.size()).to.be.equal(2);
            });
        });
        it('create 2 same permissions with existing username should return error', function () {
            var otherUserGlobalPermissions = {
                user_id: validUserGlobalPermissions.user_id,
                global_permissions: validUserGlobalPermissions.global_permissions
            };
            var permissions = new usersGlobalPermissions_1.UserGlobalPermissions(validUserGlobalPermissions);
            var otherPermissions = new usersGlobalPermissions_1.UserGlobalPermissions(otherUserGlobalPermissions);
            var promise = permissions.save()
                .then(function () { return otherPermissions.save(); });
            return chai_1.expect(promise).to.be.rejected;
        });
    });
});
describe('UsersGlobalPermissions', function () {
    describe('clearAll', function () {
        it('should clear all the users', function () {
            var promise = usersGlobalPermissions_1.UsersGlobalPermissions.clearAll();
            var usersPermissionsPromise = promise.then(function () { return new usersGlobalPermissions_1.UsersGlobalPermissions().fetch(); });
            return chai_1.expect(usersPermissionsPromise).to.eventually.fulfilled
                .then(function (userPermissions) {
                chai_1.expect(userPermissions.size()).to.be.equal(0);
            });
        });
        it('should not fail on empty table', function () {
            var promise = usersGlobalPermissions_1.UsersGlobalPermissions.clearAll().then(function () { return usersGlobalPermissions_1.UsersGlobalPermissions.clearAll(); });
            var usersPermissionsPromise = promise.then(function () { return new usersGlobalPermissions_1.UsersGlobalPermissions().fetch(); });
            return chai_1.expect(usersPermissionsPromise).to.eventually.fulfilled;
        });
    });
});
