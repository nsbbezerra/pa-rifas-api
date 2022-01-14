exports.up = function (knex) {
  return knex.schema.createTable("trophys", function (table) {
    table.increments("id");
    table
      .integer("raffle_id")
      .references("raffles.id")
      .notNullable()
      .onDelete("CASCADE");
    table.string("title");
    table.string("description");
    table.string("number");
    table.string("client_name");
    table.string("client_cpf");
    table.string("client_phone");
    table.string("client_email");
    table
      .enu("status", ["waiting", "drawn"])
      .notNullable()
      .defaultTo("waiting");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("trophys");
};
