const knex = require("../database/index");

module.exports = {
  async Store(req, res) {
    const { mode, name, text } = req.body;

    try {
      await knex("messages").insert({
        mode,
        name,
        text,
      });
      return res.status(200).json({ message: "Mensagem enviada com sucesso" });
    } catch (error) {
      console.log(error);
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao salvar informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },
};
