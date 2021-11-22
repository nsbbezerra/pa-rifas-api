exports.up = function(knex) {
  return knex.schema.createTable('trophys', function(table) {
    table.increments('id');
    table
      .integer('raffle_id')
      .references('raffles.id')
      .notNullable()
      .onDelete('CASCADE');
    table.string('title');
    table.string('description');
    table.json('owner');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('trophys');
};
