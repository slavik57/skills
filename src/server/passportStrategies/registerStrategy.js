"use strict";
var statusCode_1 = require("../enums/statusCode");
var passport = require('passport');
var passport_local_1 = require('passport-local');
var createUserOperation_1 = require("../operations/userOperations/createUserOperation");
var RegisterStrategy = (function () {
    function RegisterStrategy() {
    }
    RegisterStrategy.initialize = function (app) {
        var _this = this;
        app.post('/register', function (request, response, nextFunction) {
            var authenticateHandler = passport.authenticate(RegisterStrategy.NAME, function (_error, _user) { return _this._handleRegistrationResult(_error, _user, request, response, nextFunction); });
            authenticateHandler(request, response, nextFunction);
        });
        var options = {
            passReqToCallback: true
        };
        passport.use(RegisterStrategy.NAME, new passport_local_1.Strategy(options, this._registerUser));
    };
    RegisterStrategy._handleRegistrationResult = function (error, user, request, response, nextFunction) {
        if (error) {
            return this._respondWithError(error, response, nextFunction);
        }
        if (!user) {
            return response.status(statusCode_1.StatusCode.BAD_REQUEST).send();
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
    RegisterStrategy._respondWithError = function (error, response, nextFunction) {
        if (typeof error === "string") {
            return response.status(statusCode_1.StatusCode.BAD_REQUEST).send({ error: error });
        }
        else {
            return nextFunction(error);
        }
    };
    RegisterStrategy._registerUser = function (req, username, password, done) {
        var userRegistrationDefinition = req.body;
        var operation = new createUserOperation_1.CreateUserOperation(username, password, userRegistrationDefinition.email, userRegistrationDefinition.firstName, userRegistrationDefinition.lastName);
        operation.execute()
            .then(function (_user) {
            done(null, {
                id: _user.id
            });
        })
            .catch(function (error) {
            done(error, null);
        });
    };
    RegisterStrategy.NAME = 'register';
    return RegisterStrategy;
}());
exports.RegisterStrategy = RegisterStrategy;
//# sourceMappingURL=registerStrategy.js.map