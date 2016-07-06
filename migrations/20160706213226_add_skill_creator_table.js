
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('skill_creator', function(table){
    table.increments('id');

    table.integer('skill_id').notNullable().references('id').inTable('skills');
    table.integer('user_id').notNullable().references('id').inTable('users');

    table.index('skill_id');
    table.index('user_id');

    table.unique('skill_id');
    table.unique(['skill_id', 'user_id']);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('skill_creator');
};
