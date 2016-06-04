
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('skills', function(table){
    table.increments('id');

    table.string('name').notNullable();
    table.unique('name');
    table.index('name');
  }).then(function(){
    return knex.schema.createTableIfNotExists('skills_prerequisites', function(table){
      table.increments('id');

      table.string('skill_name').notNullable().references('name').inTable('skills');
      table.string('skill_prerequisite').notNullable().references('name').inTable('skills');

      table.unique(['skill_name', 'skill_prerequisite']);
    });
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('skills_prerequisites').then(function(){
    return knex.schema.dropTable('skills');
  });
};
