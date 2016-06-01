"use strict";
var Knex = require('knex');
var Bookshelf = require('bookshelf');
var KnexConfig = require('./knexfile');
var EnvironmentConfig = require('./environment');
var knex = Knex(KnexConfig[EnvironmentConfig.currentEnvironment]);
exports.bookshelf = Bookshelf(knex);
