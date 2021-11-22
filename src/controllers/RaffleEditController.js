const knex = require("../database/index");
const fs = require("fs");
const path = require("path");

async function RemoveImage(url) {
  fs.unlink(url, (err) => {
    if (err) console.log(err);
    else {
      console.log();
    }
  });
}

module.exports = {
  async EditImage(req, res) {
    const { id } = req.params;
    const { filename } = req.file;

    try {
      const raff = await knex
        .select("*")
        .from("raffles")
        .where({ id: id })
        .first();
      const pathToFile = path.resolve(
        __dirname,
        "..",
        "..",
        "uploads",
        raff.thumbnail
      );
      await RemoveImage(pathToFile);

      const newRaffle = await knex("raffles")
        .where({ id: id })
        .update({ thumbnail: filename })
        .returning("*");
      return res
        .status(200)
        .json({ message: "Imagem alterada com sucesso", newRaffle });
    } catch (error) {
      console.log(error);
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao alterar a imagem",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async UpdateInfo(req, res) {
    const { id } = req.params;
    const { description, name } = req.body;

    try {
      const newRaffle = await knex("raffles")
        .where({ id: id })
        .update({ description, name })
        .returning("*");

      return res
        .status(200)
        .json({ message: "Informações alteradas com sucesso", newRaffle });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao alterar as informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async RemoveRaffle(req, res) {
    const { id } = req.params;

    try {
      const raff = await knex
        .select("*")
        .from("raffles")
        .where({ id: id })
        .first();
      const pathToFile = path.resolve(
        __dirname,
        "..",
        "..",
        "uploads",
        raff.thumbnail
      );
      await RemoveImage(pathToFile);

      await knex("raffles").where({ id: id }).del();

      return res.status(200).json({ message: "Sorteio excluído com sucesso" });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao alterar as informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },
};
