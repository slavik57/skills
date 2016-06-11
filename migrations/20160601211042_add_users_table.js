
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('users', function(table){
    table.increments('id');

    table.string('username').notNullable();
    table.unique('username');
    table.index('username');

    table.string('password_hash').notNullable();

    table.string('email');
    table.unique('email');
    table.index('email');

    table.string('firstName').notNullable();
    table.string('lastName').notNullable();
    table.unique(['firstName','lastName']);
    table.index(['firstName','lastName']);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
