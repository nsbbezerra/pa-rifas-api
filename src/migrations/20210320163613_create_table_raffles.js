exports.up = function (knex) {
  return knex.schema.createTable("raffles", function (table) {
    table.increments("id");
    table.string("identify").notNullable().unique();
    table.string("name").notNullable();
    table.integer("qtd_numbers").notNullable();
    table.string("draw_date").notNullable();
    table.integer("goal");
    table
      .integer("client_id")
      .references("clients.id")
      .notNullable()
      .onDelete("CASCADE");
    table.decimal("raffle_value", 8, 2);
    table.text("description");
    table.text("justify");
    table
      .enu("status", ["open", "cancel", "drawn", "waiting", "refused"])
      .notNullable()
      .defaultTo("waiting");
    table.decimal("tax_value", 8, 2);
    table.string("thumbnail");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("raffles");
};
