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

  async StoreCouponRaffle(req, res) {
    const { coupon_hash, coupon_value, min_numbers, raffle } = req.body;

    try {
      const raffles = await knex("raffles").where({ identify: raffle }).first();
      const coupon = await knex("couponRaffle")
        .where({ coupon_hash: coupon_hash })
        .first();
      if (coupon) {
        let erros = {
          status: "400",
          type: "Erro no cupom",
          message: "Este cupom já foi criado",
          err: "Cupom duplicado",
        };
        return res.status(400).json(erros);
      }
      await knex("couponRaffle").insert({
        coupon_hash,
        coupon_value,
        min_numbers,
        raffle_id: raffles.id,
        identify: uuidv4(),
        expiration_date: "none",
      });

      return res.status(200).json({ message: "Cupom criado com sucesso" });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao salvar o cupom",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async FindRaffleCoupon(req, res) {
    const { hash } = req.params;

    try {
      const coupon = await knex
        .select("*")
        .from("couponRaffle")
        .where({ coupon_hash: hash })
        .first();

      if (!coupon) {
        let erros = {
          status: "400",
          type: "Erro no cupom",
          message: "Cupom não encontrado",
          err: "Cupom inválido",
        };
        return res.status(400).json(erros);
      }

      if (coupon.active === false) {
        let erros = {
          status: "400",
          type: "Erro no cupom",
          message: "Este cupom está inválido",
          err: "Cupom inválido",
        };
        return res.status(400).json(erros);
      }

      return res.status(200).json(coupon);
    } catch (error) {
      console.log(error);
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar o cupom",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async Active(req, res) {
    const { id } = req.params;
    const { active } = req.body;
    try {
      await knex("couponRaffle").where({ id: id }).update({ active: active });
      return res.status(200).json({ message: "Cupom alterado com sucesso" });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao alterar o cupom",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async Show(req, res) {
    const { identify } = req.params;

    try {
      const raffle = await knex
        .select("*")
        .from("raffles")
        .where({ identify: identify })
        .first();

      const coupons = await knex
        .select("*")
        .from("couponRaffle")
        .where({ raffle_id: raffle.id });

      return res.status(200).json(coupons);
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar os cupons",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },
};
