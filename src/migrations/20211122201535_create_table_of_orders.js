exports.up = function(knex) {
  return knex.schema.createTable('orders', function(table) {
    table.increments('id');
    table
      .integer('raffle_id')
      .references('raffles.id')
      .notNullable()
      .onDelete('CASCADE');
    table
      .integer('client_id')
      .references('clients.id')
      .notNullable()
      .onDelete('CASCADE');
    table
      .enu('status_numbers', ['free', 'reserved', 'paid_out'])
      .notNullable()
      .defaultTo('reserved');
    table
      .enu('status_numbers', ['waiting', 'paid_out'])
      .notNullable()
      .defaultTo('waiting');
    table.json('numbers');
    table.string('transaction_id');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('orders');
};
