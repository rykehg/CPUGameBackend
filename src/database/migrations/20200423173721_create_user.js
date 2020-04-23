
exports.up = function(knex) {
    return knex.schema.createTable('users', function (table){
        table.increments('cd_User');
        table.string('nm_Login');
        table.string('nm_Email');
        table.string('nm_Type');
        table.string('nm_Password');
        table.timestamp('dt_Register').defaultTo(knex.fn.now());

    });
    
};

exports.down = function(knex) {
    return knex.schema.dropTable('user');
};
