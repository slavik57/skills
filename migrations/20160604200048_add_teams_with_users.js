
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('teams', function(table){
    table.increments('id');

    table.string('name').notNullable();
    table.unique('name');
    table.index('name');
  }).then(function(){
    return knex.schema.createTableIfNotExists('team_members', function(table){
      table.increments('id');

      table.integer('user_id').notNullable().references('id').inTable('users');
      table.integer('team_id').notNullable().references('id').inTable('teams');

      table.index('user_id');
      table.index('team_id');

      table.unique(['user_id', 'team_id']);
    });
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('team_members').then(function(){
    return knex.schema.dropTable('teams');
  });
};
