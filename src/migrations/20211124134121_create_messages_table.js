exports.up = function(knex) {
  return knex.schema.createTable('messages', function(table) {
    table.increments('id');
    table
      .enu('mode', ['suggestion', 'criticism', 'praise'])
      .notNullable()
      .defaultTo('reserved');
    table.string('name');
    table.string('text');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('messages');
};
