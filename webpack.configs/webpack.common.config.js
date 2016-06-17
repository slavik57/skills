"use strict";
var webpack = require('webpack');
var pathHelper_1 = require('./pathHelper');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
exports.webpackCommonConfiguration = {
    entry: {
        'app': './src/app/app.ts',
        'vendor': './src/app/vendor.ts'
    },
    resolve: {
        extensions: ['', '.ts', '.js']
    },
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts'
            },
            {
                test: /\.html$/,
                loader: 'html'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file?name=assets/[name].[hash].[ext]'
            },
            {
                test: /\.css$/,
                exclude: pathHelper_1.PathHelper.getFullPathCombined('src', 'app'),
                loader: ExtractTextPlugin.extract('style', 'css?sourceMap')
            },
            {
                test: /\.css$/,
                include: pathHelper_1.PathHelper.getFullPathCombined('src', 'app'),
                loader: 'raw'
            }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: ['app', 'vendor']
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'ENV': JSON.stringify(process.env.NODE_ENV)
            }
        })
    ]
};
//# sourceMappingURL=webpack.common.config.js.map