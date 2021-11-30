const knex = require("../database/index");

module.exports = {
  async Create() {
    const configs = await knex.select("*").from("configs").first();
    if (!configs) {
      await knex("configs").insert({
        admin_phone: "(63) 99999-9999",
        max_numbers: 5000,
        raffle_value: "2.00",
        pix_taxes: "0.99",
        card_taxes: "4.99",
      });
      console.log("Configurações criadas");
    } else {
      console.log("Configurações salvas");
    }
  },
};
