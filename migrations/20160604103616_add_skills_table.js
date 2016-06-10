
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('skills', function(table){
    table.increments('id');

    table.string('name').notNullable();
    table.unique('name');
    table.index('name');
  }).then(function(){
    return knex.schema.createTableIfNotExists('skills_prerequisites', function(table){
      table.increments('id');

      table.integer('skill_id').notNullable().references('id').inTable('skills');
      table.integer('skill_prerequisite_id').notNullable().references('id').inTable('skills');

      table.index('skill_id');
      table.index('skill_prerequisite_id');

      table.unique(['skill_id', 'skill_prerequisite_id']);
    });
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('skills_prerequisites').then(function(){
    return knex.schema.dropTable('skills');
  });
};
