exports.up = function (knex) {
  return knex.schema.alterTable("numbers", function (table) {
    table
      .integer("order_id")
      .references("orders.id")
      .notNullable()
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("numbers", function (table) {
    table.dropColumn("order_id");
  });
};
