const knex = require("../database/index");

module.exports = {
  async Show(req, res) {
    try {
      const configs = await knex.select("*").from("configs").first();
      const numbers = await knex
        .select("*")
        .from("numbers")
        .where({ status: "paid_out" });
      const raffles = await knex
        .select([
          "raffles.id",
          "raffles.name",
          "raffles.identify",
          "raffles.qtd_numbers",
          "raffles.draw_date",
          "raffles.raffle_value",
          "raffles.description",
          "raffles.justify",
          "raffles.status",
          "raffles.thumbnail",
          "raffles.goal",
          "clients.id as id_client",
          "clients.name as name_client",
        ])
        .from("raffles")
        .where("status", "open")
        .innerJoin("clients", "clients.id", "raffles.client_id")
        .orderBy("raffles.updated_at", "desc");
      let numbersRaffle = await raffles.map((element) => {
        const result = numbers.filter((obj) => obj.raffle_id === element.id);
        return { raffle_id: element.id, count: result.length };
      });

      return res.status(200).json({ configs, raffles, numbersRaffle });
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
