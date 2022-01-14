exports.up = function (knex) {
  return knex.schema.createTable("petition", function (table) {
    table.increments("id");
    table.string("identify").notNullable().unique();
    table.string("name").notNullable();
    table.integer("qtd_numbers").notNullable();
    table.integer("goal");
    table.string("client_name");
    table.string("client_cpf");
    table.string("client_phone");
    table.string("client_email");
    table.string("draw_date");
    table.string("draw_time");
    table.decimal("raffle_value", 8, 2);
    table.text("description");
    table.text("trophies");
    table.string("coupon_identify");
    table.string("transaction_id");
    table.string("pay_mode_method");
    table.string("pay_mode_id");
    table.string("installments");
    table.string("thumbnail");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("petition");
};
