
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('team_skill_upvotes', function(table){
    table.increments('id');

    table.integer('team_skill_id').notNullable().references('id').inTable('team_skills');
    table.integer('user_id').notNullable().references('id').inTable('users');

    table.index('team_skill_id');
    table.index('user_id');

    table.unique(['team_skill_id', 'user_id']);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('team_skill_upvotes');
};
