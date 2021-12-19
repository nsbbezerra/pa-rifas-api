// Update with your config settings.
const path = require("path");
const tokens = require("./src/configs/tokens.json");

module.exports = {
  development: {
    client: "pg",
    connection: {
      database: tokens.DATABASE,
      user: tokens.DB_USER,
      password: tokens.DB_PASS,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: `${path.resolve(__dirname, "src", "migrations")}`,
    },
  },
};
