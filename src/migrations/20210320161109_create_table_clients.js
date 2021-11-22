exports.up = function (knex) {
  return knex.schema.createTable("clients", function (table) {
    table.increments("id");
    table.string("identify").notNullable().unique();
    table.string("name").notNullable();
    table.string("cpf").notNullable().unique();
    table.string("phone").notNullable();
    table.string("email");
    table.string("street").notNullable();
    table.string("number").notNullable();
    table.string("comp");
    table.string("district").notNullable();
    table.string("cep").notNullable();
    table.string("city").notNullable();
    table.string("state").notNullable();
    table.boolean("active_admin").notNullable().defaultTo(true);
    table.boolean("active_client").notNullable().defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("clients");
};
