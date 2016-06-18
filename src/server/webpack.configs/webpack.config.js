"use strict";
var environmentConfiguration = require('../../../environment');
var webpack_dev_config_1 = require('./webpack.dev.config');
var webpack_production_config_1 = require('./webpack.production.config');
var config;
if (environmentConfiguration.getCurrentEnvironment() === environmentConfiguration.development) {
    config = webpack_dev_config_1.webpackDevConfig;
}
else {
    config = webpack_production_config_1.webpackProductionConfig;
}
exports.webpackConfig = config;
//# sourceMappingURL=webpack.config.js.map