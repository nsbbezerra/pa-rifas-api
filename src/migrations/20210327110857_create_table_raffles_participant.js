exports.up = function (knex) {
  return knex.schema.createTable("participant", function (table) {
    table.increments("id");
    table
      .integer("raffle_id")
      .references("raffles.id")
      .notNullable()
      .onDelete("CASCADE");
    table
      .integer("client_id")
      .references("clients.id")
      .notNullable()
      .onDelete("CASCADE");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("participant");
};
