const knex = require("../database/index");
const config = require("../configs/index");

module.exports = {
  async Show(req, res) {
    try {
      const url = `${config.url}`;
      const configs = await knex.select("*").from("configs").first();
      const numbers = await knex
        .select("*")
        .from("numbers")
        .where({ status: "paid_out" });
      const banners = await knex
        .select("id", "identify", "banner")
        .from("raffles")
        .where("status", "open")
        .whereNot("banner", "NULL");
      const raffles = await knex
        .select([
          "raffles.id",
          "raffles.name",
          "raffles.identify",
          "raffles.qtd_numbers",
          "raffles.draw_date",
          "raffles.raffle_value",
          "raffles.pix_keys",
          "raffles.bank_transfer",
          "raffles.description",
          "raffles.justify",
          "raffles.refused",
          "raffles.status",
          "raffles.number_drawn",
          "raffles.thumbnail",
          "clients.id as id_client",
          "clients.name as name_client",
        ])
        .from("raffles")
        .where("status", "open")
        .innerJoin("clients", "clients.id", "raffles.client_id")
        .orderBy("raffles.updated_at", "desc");
      return res.status(200).json({ configs, raffles, url, numbers, banners });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar os dados",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },
};
