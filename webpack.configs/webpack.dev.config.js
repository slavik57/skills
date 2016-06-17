"use strict";
var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpack_common_config_1 = require('./webpack.common.config');
var pathHelper_1 = require('./pathHelper');
var config = {
    devtool: 'source-map',
    output: {
        path: pathHelper_1.PathHelper.getFullPathCombined('dist'),
        publicPath: '/dist',
        filename: '[name].js',
        chunkFilename: '[id].chunk.js'
    },
    plugins: [
        new ExtractTextPlugin('[name].css')
    ]
};
exports.webpackDevConfig = webpackMerge(webpack_common_config_1.webpackCommonConfiguration, config);
//# sourceMappingURL=webpack.dev.config.js.map