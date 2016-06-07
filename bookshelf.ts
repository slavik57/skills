import * as Knex from 'knex';
import * as Bookshelf from 'bookshelf';
import * as Fs from 'fs';
import * as KnexConfig from './knexfile';
import * as EnvironmentConfig from './environment';

var cascadeDelete = require('bookshelf-cascade-delete');

var knex = Knex(KnexConfig[EnvironmentConfig.currentEnvironment]);

var bookshelfInstance = Bookshelf(knex);
bookshelfInstance.plugin(cascadeDelete.default);

export var bookshelf = bookshelfInstance;
