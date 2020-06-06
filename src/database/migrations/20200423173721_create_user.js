
exports.up = function(knex) {
  return knex.schema.createTable('users', function (table){
    table.increments('cd_User');
    table.string('nm_Name', 30);
    table.string('nm_Login', 30);
    table.string('nm_Email', 40);
    table.string('nm_Type', 9);
    table.string('nm_Password', 20);
    table.timestamp('dt_Register').defaultTo(knex.fn.now());
    table.timestamp('dt_Expire');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
