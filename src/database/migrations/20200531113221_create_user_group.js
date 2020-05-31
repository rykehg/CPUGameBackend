

exports.up = function(knex) {
    return knex.schema.createTable('user_group', function (table){
        table.increments('cd_User_Group');
        table.integer('cd_User').notNullable();
        table.integer('cd_Group').notNullable();
        
        table.foreign('Cd_User').references('cd_User').inTable('users');
        table.foreign('Cd_Group').references('cd_Group').inTable('groups');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('user_group');
};
