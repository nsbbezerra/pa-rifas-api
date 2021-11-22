const knex = require("../database/index");

module.exports = {
  async Store(req, res) {
    const { admin_phone, max_numbers, raffle_value } = req.body;
    try {
      await knex("configs").insert({ admin_phone, max_numbers, raffle_value });
      return res
        .status(201)
        .json({ message: "Configurações criadas com sucesso" });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao cadastrar o cliente",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async Update(req, res) {
    const { admin_phone, max_numbers, raffle_value } = req.body;
    const { id } = req.params;
    try {
      const configs = await knex("configs")
        .where({ id: id })
        .update({ admin_phone, max_numbers, raffle_value })
        .returning("*");
      return res
        .status(201)
        .json({ message: "Alteração concluída com suceso", configs });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao cadastrar o cliente",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async Show(req, res) {
    try {
      const configs = await knex.select("*").from("configs").first();
      return res.status(200).json(configs);
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao cadastrar o cliente",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },
};
