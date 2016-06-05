
exports.up = function(knex, Promise) {
  return knex.schema.table('team_members', function(table){
    table.boolean('is_admin').notNullable().defaultTo(false);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('team_members', function(table){
    table.dropColumn('is_admin');
  });
};
