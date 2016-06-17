"use strict";
var path = require('path');
exports.webpackConfiguration = {
    entry: {
        app: './src/client.js'
    },
    output: {
        path: path.join(__dirname, '/dist/'),
        filename: '[name].js',
        publicPath: '/dist'
    }
};
