"use strict";
var passport = require('passport');
var passport_local_1 = require('passport-local');
var loginUserOperation_1 = require("../operations/userOperations/loginUserOperation");
var LoginStrategy = (function () {
    function LoginStrategy() {
    }
    LoginStrategy.initialize = function (app) {
        app.post('/login', passport.authenticate(LoginStrategy.NAME, {
            successRedirect: '/',
            failureRedirect: '/signin'
        }));
        var options = {
            passReqToCallback: true
        };
        passport.use(LoginStrategy.NAME, new passport_local_1.Strategy(options, this._loginUser));
    };
    LoginStrategy._loginUser = function (req, username, password, done) {
        var operation = new loginUserOperation_1.LoginUserOperation(username, password);
        operation.execute()
            .then(function (_user) {
            req.session.success = 'You are successfully logged in ' + username + '!';
            done(null, { id: _user.id, username: _user.attributes.username });
        })
            .catch(function (error) {
            req.session.error = error;
            done(null, null);
        });
    };
    LoginStrategy.NAME = 'login';
    return LoginStrategy;
}());
exports.LoginStrategy = LoginStrategy;
