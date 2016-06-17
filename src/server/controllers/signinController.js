"use strict";
var pathHelper_1 = require('../../common/pathHelper');
var server_1 = require('../server');
module.exports = {
    get_index: function (request, response) {
        response.write(server_1.webpackMiddlewareInstance.fileSystem.readFileSync(pathHelper_1.PathHelper.getPathFromRoot('dist', 'signin.html')));
        response.end();
    }
};
//# sourceMappingURL=signinController.js.map