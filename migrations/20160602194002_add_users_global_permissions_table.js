
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('users_global_permissions', function(table){
    table.increments('id');

    table.string('username').notNullable().references('username').inTable('users');
    table.index('username');

    table.enu('global_permissions',
      [
        'ADMIN',
        'TEAMS_LIST_ADMIN',
        'SKILLS_LIST_ADMIN',
        'READER',
        'GUEST'
      ]).notNullable('global_permissions');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users_global_permissions');
};
