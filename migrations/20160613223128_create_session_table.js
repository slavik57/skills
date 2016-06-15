
exports.up = function(knex, Promise) {
  // NOTE: taken from: https://github.com/voxpelli/node-connect-pg-simple/blob/master/table.sql

  var createTableSql =
    'CREATE TABLE "session" (' +
      '"sid" varchar NOT NULL COLLATE "default",' +
      '"sess" json NOT NULL,' +
      '"expire" timestamp(6) NOT NULL' +
    ')' +
    'WITH (OIDS=FALSE);';

  var addPrimaryKeySql =
    'ALTER TABLE "session" ADD CONSTRAINT "session_pkey"' +
    'PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;';

  return knex.schema.raw(createTableSql + addPrimaryKeySql);
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('session');
};
