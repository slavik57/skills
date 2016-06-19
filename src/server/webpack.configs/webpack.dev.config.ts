var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
import {Configuration} from 'webpack';
import {webpackCommonConfiguration} from './webpack.common.config'
import {PathHelper} from '../../common/pathHelper';

var config: Configuration = {
  devtool: 'source-map',

  output: {
    path: PathHelper.getPathFromRoot('dist'),
    publicPath: '/dist/',
    filename: '[name].js',
    chunkFilename: '[id].chunk.js'
  },

  plugins: [
    new ExtractTextPlugin('[name].css')
  ]

}



export var webpackDevConfig: Configuration =
  webpackMerge(webpackCommonConfiguration, config);
