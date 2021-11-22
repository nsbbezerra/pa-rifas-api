const knex = require("../database/index");
const config = require("../configs/index");

module.exports = {
  async Show(req, res) {
    try {
      const url = config.url;
      const configs = await knex.select("*").from("configs").first();
      return res.status(200).json({ url, configs });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no login",
        message: "Ocorreu um erro ao buscar informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async Admin(req, res) {
    const { id } = req.params;

    try {
      const client = await knex
        .select("*")
        .from("clients")
        .where("identify", id)
        .first();
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
          "raffles.client_drawn",
          "clients.id as id_client",
          "clients.name as name_client",
          "clients.phone as phone_client",
        ])
        .from("raffles")
        .where("client_id", client.id)
        .innerJoin("clients", "clients.id", "raffles.client_id")
        .orderBy("raffles.updated_at");
      return res.status(200).json(raffles);
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no login",
        message: "Ocorreu um erro ao buscar informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async Client(req, res) {
    const { id } = req.params;

    try {
      const client = await knex
        .select("*")
        .from("clients")
        .where("identify", id)
        .first();
      const participant = await knex
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
          "raffles.client_drawn",
          "clients.id as id_client",
          "clients.name as name_client",
          "clients.phone as phone_client",
        ])
        .from("participant")
        .where("participant.client_id", client.id)
        .innerJoin("clients", "clients.id", "participant.client_id")
        .innerJoin("raffles", "raffles.id", "participant.raffle_id")
        .orderBy("raffles.updated_at");
      return res.status(200).json(participant);
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no login",
        message: "Ocorreu um erro ao buscar informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },
};
