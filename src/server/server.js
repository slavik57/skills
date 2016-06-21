"use strict";
var expressServer_1 = require('./expressServer');
expressServer_1.ExpressServer.instance
    .initialize()
    .then(function (_expressServer) { return _expressServer.start(); });
//# sourceMappingURL=server.js.map