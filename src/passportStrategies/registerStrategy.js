"use strict";
var passport = require('passport');
var passport_local_1 = require('passport-local');
var createUserOperation_1 = require("../operations/userOperations/createUserOperation");
var RegisterStrategy = (function () {
    function RegisterStrategy() {
    }
    RegisterStrategy.initialize = function (app) {
        app.post('/register', passport.authenticate(RegisterStrategy.NAME, {
            successRedirect: '/',
            failureRedirect: '/signin'
        }));
        var options = {
            passReqToCallback: true
        };
        passport.use(RegisterStrategy.NAME, new passport_local_1.Strategy(options, this._registerUser));
    };
    RegisterStrategy._registerUser = function (req, username, password, done) {
        var operation = new createUserOperation_1.CreateUserOperation(username, password, req.body.email, req.body.firstName, req.body.lastName);
        operation.execute()
            .then(function (_user) {
            req.session.success = 'You are successfully registered and logged in ' + username + '!';
            done(null, { id: _user.id, username: _user.attributes.username });
        })
            .catch(function (error) {
            req.session.error = error;
            done(null, null);
        });
    };
    RegisterStrategy.NAME = 'register';
    return RegisterStrategy;
}());
exports.RegisterStrategy = RegisterStrategy;
