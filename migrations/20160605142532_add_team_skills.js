
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('team_skills', function(table){
    table.increments('id');

    table.integer('user_id').notNullable().references('id').inTable('users');
    table.integer('skill_id').notNullable().references('id').inTable('skills');

    table.index('user_id');
    table.index('skill_id');

    table.unique(['user_id', 'skill_id']);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('team_skills');
};
