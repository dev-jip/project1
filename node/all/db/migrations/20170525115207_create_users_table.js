
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function (table) {
    table.increments();
    table.string('email');
    table.string('password');
    table.timestamps();
  })

};

exports.down = function(knex, Promise) {

};
