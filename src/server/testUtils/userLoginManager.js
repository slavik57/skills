"use strict";
var UserLoginManager = (function () {
    function UserLoginManager() {
    }
    UserLoginManager.registerUser = function (server, userDefinition) {
        return new Promise(function (resolveCallback) {
            server.post('/register')
                .send(userDefinition)
                .end(function () { return resolveCallback(); });
        });
    };
    UserLoginManager.loginUser = function (server, userDefinition) {
        return new Promise(function (resolveCallback) {
            server.post('/login')
                .send({ username: userDefinition.username, password: userDefinition.password })
                .end(function () { return resolveCallback(); });
        });
    };
    UserLoginManager.logoutUser = function (server) {
        return new Promise(function (resolveCallback) {
            server.get('/logout')
                .end(function () { return resolveCallback(); });
        });
    };
    return UserLoginManager;
}());
exports.UserLoginManager = UserLoginManager;
//# sourceMappingURL=userLoginManager.js.map