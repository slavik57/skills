
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('user_global_permissions', function(table){
    table.increments('id');

    table.string('username').notNullable();
    table.unique('username');
    table.index('username');

    table.enu('global_permissions',
      [
        'ADMIN',
        'TEAMS_LIST_ADMIN',
        'SKILLS_LIST_ADMIN',
        'READER',
        'GUEST'
      ]).notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('user_global_permissions');
};
