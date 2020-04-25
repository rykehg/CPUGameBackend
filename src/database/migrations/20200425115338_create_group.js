
exports.up = function(knex) {
    return knex.schema.createTable('groups', function (table){
        table.increments('cd_Group');
        table.string('nm_Group', 20);
        table.timestamp('dt_RegisterGroup').defaultTo(knex.fn.now());
        table.integer('cd_User1');
        table.integer('cd_User2');
        table.integer('cd_User3');
        table.integer('cd_User4');
        table.integer('cd_User5');
        table.integer('cd_User6');

        table.foreign('Cd_User1').references('cd_User').inTable('users');
        table.foreign('Cd_User2').references('cd_User').inTable('users');
        table.foreign('Cd_User3').references('cd_User').inTable('users');
        table.foreign('Cd_User4').references('cd_User').inTable('users');
        table.foreign('Cd_User5').references('cd_User').inTable('users');
        table.foreign('Cd_User6').references('cd_User').inTable('users');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('groups');
};
