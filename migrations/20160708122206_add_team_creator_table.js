
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('team_creator', function(table){
    table.increments('id');

    table.integer('team_id').notNullable().references('id').inTable('teams');
    table.integer('user_id').notNullable().references('id').inTable('users');

    table.index('team_id');
    table.index('user_id');

    table.unique('team_id');
    table.unique(['team_id', 'user_id']);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('team_creator');
};
