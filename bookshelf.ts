import * as Knex from 'knex';
import * as Bookshelf from 'bookshelf';
import * as Fs from 'fs';
import * as KnexConfig from './knexfile';
import * as EnvironmentConfig from './environment';

var knex = Knex(KnexConfig[EnvironmentConfig.currentEnvironment]);

export var bookshelf = Bookshelf(knex);
