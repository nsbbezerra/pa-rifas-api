exports.up = function (knex) {
  return knex.schema.createTable("configs", function (table) {
    table.increments("id");
    table.string("admin_phone");
    table.integer("max_numbers");
    table.decimal("raffle_value", 8, 2);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("configs");
};
