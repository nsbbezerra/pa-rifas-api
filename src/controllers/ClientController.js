const knex = require("../database/index");
const uniqid = require("uniqid");

module.exports = {
  async Store(req, res) {
    const {
      name,
      cpf,
      phone,
      email,
      street,
      number,
      comp,
      district,
      cep,
      city,
      state,
    } = req.body;

    try {
      const find = await knex
        .select("cpf")
        .from("clients")
        .where({ cpf })
        .first();

      if (find) {
        return res.status(400).json({ message: "Este CPF já foi cadastrado" });
      }

      await knex("clients").insert({
        identify: uniqid("cliente-"),
        name,
        cpf,
        phone,
        email,
        street,
        number,
        comp,
        district,
        cep,
        city,
        state,
      });

      return res.status(201).json({ message: "Cadastro efetuado com sucesso" });
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
    const { id } = req.params;
    const {
      name,
      cpf,
      phone,
      email,
      street,
      number,
      comp,
      district,
      cep,
      city,
      state,
    } = req.body;
    try {
      const client = await knex("clients")
        .where({ identify: id })
        .update({
          name,
          cpf,
          phone,
          email,
          street,
          number,
          comp,
          district,
          cep,
          city,
          state,
        })
        .returning("*");

      return res
        .status(201)
        .json({ message: "Alteração concluída com sucesso", client });
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

  async Login(req, res) {
    const { cpf } = req.body;
    try {
      const client = await knex
        .select("*")
        .from("clients")
        .where({ cpf })
        .first();
      if (!client) {
        return res.status(400).json({ message: "Cliente não encontrado" });
      }
      return res.status(200).json(client);
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no login",
        message: "Ocorreu um erro ao fazer o login",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async SetBannAdmin(req, res) {
    const { id } = req.params;
    const { active_admin } = req.body;
    try {
      await knex("clients").where({ id: id }).update({ active_admin });
      return res.status(201).json({ message: "Alteração concluída com êxito" });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no login",
        message: "Ocorreu um erro alterar a informação",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async SetBannClient(req, res) {
    const { id } = req.params;
    const { active_client } = req.body;
    try {
      await knex("clients").where({ id: id }).update({ active_client });
      return res.status(201).json({ message: "Alteração concluída com êxito" });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no login",
        message: "Ocorreu um erro alterar a informação",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async Show(req, res) {
    try {
      const clients = await knex.select("*").from("clients").orderBy("name");
      return res.status(200).json(clients);
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no login",
        message: "Ocorreu um erro buscar as informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },
};
