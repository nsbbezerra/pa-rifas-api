// Update with your config settings.
const path = require('path')
const tokens = require('./src/configs/tokens.json')

module.exports = {
  development: {
    client: 'pg',
    connection: {
      database: tokens.AMBIENT === 'dev' ? 'parifas' : tokens.DATABASE,
      user: tokens.AMBIENT === 'dev' ? 'postgres' : tokens.DB_USER,
      password: tokens.AMBIENT === 'dev' ? '03102190' : tokens.DB_PASS,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: `${path.resolve(__dirname, 'src', 'migrations')}`,
    },
  },
}
