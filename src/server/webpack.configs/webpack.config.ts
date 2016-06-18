import * as environmentConfiguration from '../../../environment';
import {webpackDevConfig} from './webpack.dev.config';
import {webpackProductionConfig} from './webpack.production.config';
import {Configuration} from 'webpack';

var config: Configuration;
if (environmentConfiguration.getCurrentEnvironment() === environmentConfiguration.development) {
  config = webpackDevConfig;
} else {
  config = webpackProductionConfig;
}

export var webpackConfig = config;
