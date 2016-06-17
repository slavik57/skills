"use strict";
var LogoutStrategy = (function () {
    function LogoutStrategy() {
    }
    LogoutStrategy.initialize = function (app) {
        app.get('/logout', function (req, res) {
            var name = req.user.username;
            console.log("LOGGIN OUT " + req.user.username);
            req.logout();
            res.redirect('/');
            req.session.notice = "You have successfully been logged out " + name + "!";
        });
    };
    LogoutStrategy.NAME = 'logout';
    return LogoutStrategy;
}());
exports.LogoutStrategy = LogoutStrategy;
//# sourceMappingURL=logoutStrategy.js.map