"use strict";
var webpack = require('webpack');
var pathHelper_1 = require('../../common/pathHelper');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
exports.webpackCommonConfiguration = {
    entry: {
        'app': './src/app/app.ts',
        'vendor': './src/app/vendor.ts'
    },
    resolve: {
        extensions: ['', '.ts', '.js', 'scss']
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
                test: /\.scss$/,
                loaders: ["style", "css", "sass"]
            },
            {
                test: /\.css$/,
                exclude: pathHelper_1.PathHelper.getPathFromRoot('src', 'app', 'modules'),
                loader: ExtractTextPlugin.extract('style', 'css?sourceMap')
            },
            {
                test: /\.css$/,
                include: pathHelper_1.PathHelper.getPathFromRoot('src', 'app', 'modules'),
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
        }),
        new HtmlWebpackPlugin({
            template: pathHelper_1.PathHelper.getPathFromRoot('src', 'app', 'views', 'signin.html'),
            filename: 'signin.html'
        }),
        new HtmlWebpackPlugin({
            template: pathHelper_1.PathHelper.getPathFromRoot('src', 'app', 'views', 'home.html'),
            filename: 'home.html'
        })
    ]
};
//# sourceMappingURL=webpack.common.config.js.map