const knex = require("../database/index");

module.exports = {
  async Find(req, res) {
    const { id } = req.params;

    try {
      const trophy = await knex
        .select("*")
        .from("trophys")
        .where({ id: id })
        .first();
      const client = await knex
        .select("*")
        .from("clients")
        .where({ identify: trophy.client_identify })
        .first();
      return res.status(200).json({ trophy, client });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar as informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },
};
