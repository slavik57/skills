"use strict";
var user_1 = require('../../models/user');
var TestUtils = (function () {
    function TestUtils() {
    }
    TestUtils.clearUsersTable = function (done) {
        var promises = [];
        new user_1.Users().fetch().then(function (users) {
            users.each(function (user) {
                var promise = user.destroy(null);
                promises.push(promise);
            });
            Promise.all(promises).then(function () { return done(); });
        });
    };
    return TestUtils;
}());
exports.TestUtils = TestUtils;
