exports.up = function (knex) {
  return knex.schema.createTable("couponRaffle", function (table) {
    table.increments("id");
    table
      .integer("raffle_id")
      .references("raffles.id")
      .notNullable()
      .onDelete("CASCADE");
    table.string("identify");
    table.string("coupon_hash");
    table.decimal("coupon_value", 8, 2);
    table.integer("min_numbers");
    table.string("expiration_date").notNullable();
    table.boolean("active").notNullable().defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("couponRaffle");
};
