"use strict";
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var user_1 = require('./user');
chai.use(chaiAsPromised);
describe('UserGlobalPermissions', function () {
    describe('new', function () {
        var validUserInfo;
        beforeEach(function (done) {
            user_1.Users.clearUsersTable(done);
            validUserInfo = {
                username: 'slavik57',
                password_hash: 'some hash',
                email: 's@gmail.com',
                firstName: 'Slava',
                lastName: 'Shp',
            };
        });
        afterEach(function (done) {
            user_1.Users.clearUsersTable(done);
        });
    });
});
