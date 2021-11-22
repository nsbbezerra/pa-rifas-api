exports.up = function (knex) {
  return knex.schema.createTable("numbers", function (table) {
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
    table
      .enu("status", ["free", "reserved", "paid_out"])
      .notNullable()
      .defaultTo("reserved");
    table.integer("number").notNullable();
    table.string("expiration_date").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("numbers");
};
