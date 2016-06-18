"use strict";
var LogoutStrategy = (function () {
    function LogoutStrategy() {
    }
    LogoutStrategy.initialize = function (app) {
        app.get('/logout', function (req, res) {
            req.logout();
            res.redirect('/');
        });
    };
    LogoutStrategy.NAME = 'logout';
    return LogoutStrategy;
}());
exports.LogoutStrategy = LogoutStrategy;
//# sourceMappingURL=logoutStrategy.js.map