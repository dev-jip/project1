
exports.up = function(knex, Promise) {
  return knex.schema.createTable('cards', function (table) {
    table.increments();
    table.string('img');
    table.timestamps();
  })
};

exports.down = function(knex, Promise) {
  
};
