import * as webpack from 'webpack';
import {Configuration} from 'webpack';
import * as path from 'path';

export var webpackConfiguration: Configuration = {
  entry: {
    app: './src/client.js'
  },
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: '[name].js',
    publicPath: '/dist'
  }
}
