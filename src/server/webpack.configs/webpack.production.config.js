"use strict";
var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpack = require('webpack');
var webpack_common_config_1 = require('./webpack.common.config');
var pathHelper_1 = require('../../common/pathHelper');
var config = {
    devtool: 'source-map',
    output: {
        path: pathHelper_1.PathHelper.getPathFromRoot('dist'),
        publicPath: '/dist/',
        filename: '[name].[hash].js',
        chunkFilename: '[id].[hash].chunk.js'
    },
    plugins: [
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin(),
        new ExtractTextPlugin('[name].[hash].css')
    ]
};
exports.webpackProductionConfig = webpackMerge(webpack_common_config_1.webpackCommonConfiguration, config);
//# sourceMappingURL=webpack.production.config.js.map