exports.up = function (knex) {
  return knex.schema.createTable("revenues", function (table) {
    table.increments("id");
    table.string("raffle_title");
    table.decimal("value", 8, 2);
    table.string("month");
    table.string("year");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("revenues");
};
