exports.up = function (knex) {
  return knex.schema.createTable("coupon", function (table) {
    table.increments("id");
    table.string("identify");
    table.string("raffle");
    table.string("coupon_hash");
    table.decimal("coupon_value", 8, 2);
    table.integer("quota");
    table
      .enu("status", ["open", "used", "free"])
      .notNullable()
      .defaultTo("open");
    table.string("expiration_date").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("coupon");
};
