exports.up = function (knex) {
  return knex.schema.createTable("numbers", function (table) {
    table.increments("id");
    table
      .integer("raffle_id")
      .references("raffles.id")
      .notNullable()
      .onDelete("CASCADE");
    table
      .enu("status", ["free", "reserved", "paid_out"])
      .notNullable()
      .defaultTo("free");
    table.enu("status_drawn", ["open", "draw"]).notNullable().defaultTo("open");
    table.string("number").notNullable();
    table.string("client_name");
    table.string("client_cpf");
    table.string("client_email");
    table.string("order_identify");
    table.string("expiration_date").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("numbers");
};
