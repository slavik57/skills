"use strict";
var statusCode_1 = require("../enums/statusCode");
var passport = require('passport');
var passport_local_1 = require('passport-local');
var loginUserOperation_1 = require("../operations/userOperations/loginUserOperation");
var LoginStrategy = (function () {
    function LoginStrategy() {
    }
    LoginStrategy.initialize = function (app) {
        var _this = this;
        app.post('/login', function (request, response, nextFunction) {
            var authenticateHandler = passport.authenticate(LoginStrategy.NAME, function (_error, _user) { return _this._handleLoginResult(_error, _user, request, response, nextFunction); });
            authenticateHandler(request, response, nextFunction);
        });
        var options = {
            passReqToCallback: true
        };
        passport.use(LoginStrategy.NAME, new passport_local_1.Strategy(options, this._loginUser));
    };
    LoginStrategy._handleLoginResult = function (error, user, request, response, nextFunction) {
        if (error) {
            return nextFunction(error);
        }
        if (!user) {
            return response.status(statusCode_1.StatusCode.UNAUTHORIZED).send();
        }
        request.logIn(user, function (_error) {
            if (_error) {
                return nextFunction(_error);
            }
            response.status(statusCode_1.StatusCode.OK);
            response.setHeader('redirect-path', '/');
            response.send();
        });
    };
    LoginStrategy._loginUser = function (req, username, password, done) {
        var operation = new loginUserOperation_1.LoginUserOperation(username, password);
        operation.execute()
            .then(function (_user) {
            done(null, {
                id: _user.id
            });
        })
            .catch(function (error) {
            done(null, null);
        });
    };
    LoginStrategy.NAME = 'login';
    return LoginStrategy;
}());
exports.LoginStrategy = LoginStrategy;
//# sourceMappingURL=loginStrategy.js.map