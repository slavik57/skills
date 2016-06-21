import * as webpack from 'webpack';
import {Configuration} from 'webpack';
import * as path from 'path';
import {PathHelper} from '../../common/pathHelper';
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

export var webpackCommonConfiguration: Configuration = {
  entry: {
    'app': './src/app/app.ts',
    'vendor': './src/app/vendor.ts',
    'design': './src/app/design.scss'
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
        loaders: ["style", "css", 'resolve-url', 'sass?sourceMap']
      },
      {
        test: /\.css$/,
        exclude: PathHelper.getPathFromRoot('src', 'app', 'modules'),
        loaders: ['style', 'css', 'resolve-url']
      },
      {
        test: /\.css$/,
        include: PathHelper.getPathFromRoot('src', 'app', 'modules'),
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
      template: PathHelper.getPathFromRoot('src', 'app', 'views', 'signin.html'),
      filename: 'signin.html'
    }),
    new HtmlWebpackPlugin({
      template: PathHelper.getPathFromRoot('src', 'app', 'views', 'home.html'),
      filename: 'home.html'
    })
  ]
}
