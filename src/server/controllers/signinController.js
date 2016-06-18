"use strict";
var pathHelper_1 = require('../../common/pathHelper');
var expressServer_1 = require('../expressServer');
module.exports = {
    get_index: function (request, response) {
        var webpackMiddleware = expressServer_1.ExpressServer.instance.webpackMiddleware;
        response.write(webpackMiddleware.fileSystem.readFileSync(pathHelper_1.PathHelper.getPathFromRoot('dist', 'signin.html')));
        response.end();
    }
};
//# sourceMappingURL=signinController.js.map