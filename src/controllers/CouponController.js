const knex = require("../database/index");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async Create(req, res) {
    const { coupon_hash, coupon_value } = req.body;
    try {
      const coupon = await knex("coupon")
        .where({ coupon_hash: coupon_hash })
        .first();
      if (coupon) {
        let erros = {
          status: "400",
          type: "Erro no cadastro",
          message: "Este cupom já existe",
          err: "Cupom duplicado",
        };
        return res.status(400).json(erros);
      }
      await knex("coupon").insert({
        identify: uuidv4(),
        coupon_hash,
        coupon_value,
        expiration_date: "none",
      });
      return res.status(200).json({ message: "Cupom cadastrado com sucesso" });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao cadastrar o cupom",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async Find(req, res) {
    const { hash } = req.params;

    try {
      const coupon = await knex
        .select("*")
        .from("coupon")
        .where({ coupon_hash: hash })
        .first();

      if (!coupon) {
        let erros = {
          status: "400",
          type: "Erro no cupom",
          message: "Cupom não encontrado",
          err: "Sem cupom",
        };
        return res.status(400).json(erros);
      }

      if (coupon.status !== "open") {
        let erros = {
          status: "400",
          type: "Erro no cupom",
          message: "Este cupom já foi usado",
          err: "Cupom inválido",
        };
        return res.status(400).json(erros);
      }

      return res.status(200).json(coupon);
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar o cupom",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },
};
