const knex = require("../database/index");
const configs = require("../configs/index");
const mercadopago = require("mercadopago");

mercadopago.configure({ access_token: configs.payment_token });

module.exports = {
  async PayRaffle(req, res) {
    const { data } = req.body;
    const { id } = req.params;
    try {
      async function saveStatusRaffle() {
        await knex("raffles")
          .where({ identify: id })
          .update({ status: "open" });
      }
      mercadopago.payment
        .findById(data.id)
        .then((data) => {
          const { response } = data;
          const status = response.status;
          if (status === "approved") {
            saveStatusRaffle();
          }
          return res.status(201).json({ message: "OK" });
        })
        .catch((err) => {
          let erros = {
            status: "400",
            type: "Erro no login",
            message: "Ocorreu um erro",
            err: error.message,
          };
          return res.status(400).json(erros);
        });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no login",
        message: "Ocorreu um erro",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },
};
