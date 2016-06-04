
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('users_global_permissions', function(table){
    table.increments('id');

    table.integer('user_id').notNullable().references('id').inTable('users');
    table.index('user_id');

    table.enu('global_permissions',
      [
        'ADMIN',
        'TEAMS_LIST_ADMIN',
        'SKILLS_LIST_ADMIN',
        'READER',
        'GUEST'
      ]).notNullable('global_permissions');

    table.unique(['user_id','global_permissions']);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users_global_permissions');
};
