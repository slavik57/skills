
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('team_skills', function(table){
    table.increments('id');

    table.integer('team_id').notNullable().references('id').inTable('teams');
    table.integer('skill_id').notNullable().references('id').inTable('skills');

    table.index('team_id');
    table.index('skill_id');

    table.unique(['team_id', 'skill_id']);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('team_skills');
};
