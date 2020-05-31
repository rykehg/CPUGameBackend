

exports.up = function(knex) {
    return knex.schema.createTable('game', function (table){
        table.increments('cd_Match');
        table.string('nm_Game', 20);
        table.timestamp('dt_Game').defaultTo(knex.fn.now());
        table.integer('cd_Group1').notNullable();
        table.integer('cd_Group2').notNullable();
        table.integer('cd_Group3');
        table.integer('cd_Group4');
        table.integer('cd_Group5');
        table.integer('cd_Group6');

        table.foreign('Cd_Group1').references('cd_Group').inTable('groups');
        table.foreign('Cd_Group2').references('cd_Group').inTable('groups');
        table.foreign('Cd_Group3').references('cd_Group').inTable('groups');
        table.foreign('Cd_Group4').references('cd_Group').inTable('groups');
        table.foreign('Cd_Group5').references('cd_Group').inTable('groups');
        table.foreign('Cd_Group6').references('cd_Group').inTable('groups');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('game');
};
