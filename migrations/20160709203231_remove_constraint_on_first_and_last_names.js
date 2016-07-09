
exports.up = function(knex, Promise) {
  return knex.schema.table('users', function(table){
    table.dropUnique(['firstName','lastName']);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', function(table){
    table.unique(['firstName','lastName']);
  });
};
