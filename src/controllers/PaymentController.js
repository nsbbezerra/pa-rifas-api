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

  async WebhookPay(req, res) {
    const { data_id } = req.query;
    const { identify } = req.params;
    try {
      const order = await knex("orders").where({ identify: identify }).first();
      if (!order) {
        return res.status(200).json({ ok });
      }
      async function saveStatusOrder(pay) {
        let valueTax;
        let valueDiscounted;

        if (pay === "credit_card") {
          const calc = parseFloat(order.value) * (configs.cardTax / 100);
          const rest = parseFloat(order.value) - calc;
          valueTax = calc;
          valueDiscounted = rest;
        }

        if (pay === "pix") {
          const calc = parseFloat(order.value) * (configs.pixTax / 100);
          const rest = parseFloat(order.value) - calc;
          valueTax = calc;
          valueDiscounted = rest;
        }

        await knex("orders")
          .where({ identify: identify })
          .update({
            transaction_id: data_id,
            status: "paid_out",
            discounted_value: valueDiscounted,
            tax: valueTax,
            pay_mode: pay === "pix" ? "pix" : "card",
          });
        await knex("numbers")
          .where({ order_id: order.id })
          .update({ status: "paid_out" });
      }
      mercadopago.payment
        .findById(data_id)
        .then((data) => {
          const { response } = data;
          const status = response.status;
          const payment_id = response.payment_method_id;
          if (status === "approved") {
            saveStatusOrder(payment_id);
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
        type: "Erro no pagamento",
        message: "Ocorreu um erro",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },
};
