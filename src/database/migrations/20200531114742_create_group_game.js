

exports.up = function(knex) {
    return knex.schema.createTable('group_game', function (table){
        table.increments('cd_Group_Game');
        table.integer('cd_Game').notNullable();
        table.integer('cd_Group').notNullable();
        
        table.foreign('Cd_Game').references('cd_Match').inTable('game');
        table.foreign('Cd_Group').references('cd_Group').inTable('groups');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('group_game');
};
