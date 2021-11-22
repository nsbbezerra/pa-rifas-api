const knex = require("../database/index");

module.exports = {
  async Create() {
    const configs = await knex.select("*").from("configs").first();
    if (!configs) {
      await knex("configs").insert({
        admin_phone: "(63) 99999-9999",
        max_numbers: 1000,
        raffle_value: "0.00",
      });
      console.log("Configurações criadas");
    } else {
      console.log("Configurações salvas");
    }
  },
};
