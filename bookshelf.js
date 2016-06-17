"use strict";
var Knex = require('knex');
var Bookshelf = require('bookshelf');
var KnexConfig = require('./knexfile');
var cascadeDelete = require('bookshelf-cascade-delete');
var knex = Knex(KnexConfig.knexConfig);
var bookshelfInstance = Bookshelf(knex);
bookshelfInstance.plugin(cascadeDelete.default);
exports.bookshelf = bookshelfInstance;
//# sourceMappingURL=bookshelf.js.map