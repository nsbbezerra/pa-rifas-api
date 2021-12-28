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
    const { data } = req.body;
    const { identify } = req.params;

    try {
      if (data) {
        const order = await knex("orders")
          .where({ identify: identify })
          .first();
        if (!order) {
          return res.status(200).json({ ok });
        }
        async function saveStatusOrder(pay) {
          let valueTax;
          let valueDiscounted;
          let typePayment;

          if (pay === "credit_card") {
            const calc = parseFloat(order.value) * (configs.cardTax / 100);
            const rest = parseFloat(order.value) - calc;
            valueTax = calc;
            valueDiscounted = rest;
            typePayment = "card";
          }

          if (pay === "pix") {
            const calc = parseFloat(order.value) * (configs.pixTax / 100);
            const rest = parseFloat(order.value) - calc;
            valueTax = calc;
            valueDiscounted = rest;
            typePayment = "pix";
          }

          if (pay === "debit_card") {
            const calc = parseFloat(orderAct.value) * (configs.debitTax / 100);
            const rest = parseFloat(orderAct.value) - calc;
            valueTax = calc;
            valueDiscounted = rest;
            typePayment = "debit";
          }

          if (pay === "account_money") {
            const calc = parseFloat(order.value) * (configs.cardTax / 100);
            const rest = parseFloat(order.value) - calc;
            valueTax = calc;
            valueDiscounted = rest;
            typePayment = "ticket";
          }

          await knex("orders").where({ identify: identify }).update({
            transaction_id: data.id,
            status: "paid_out",
            discounted_value: valueDiscounted,
            tax: valueTax,
            pay_mode: typePayment,
          });
          await knex("numbers")
            .where({ order_id: order.id })
            .update({ status: "paid_out" });
        }
        mercadopago.payment
          .findById(data.id)
          .then((data) => {
            const { response } = data;
            const status = response.status;
            const payment_id = response.payment_type_id;
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
      } else {
        return res
          .status(200)
          .json({ message: "ID de pagamento não presente" });
      }
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

  async FindOrderById(req, res) {
    const { id } = req.params;

    try {
      const order = await knex
        .select("*")
        .from("orders")
        .where({ transaction_id: id })
        .first();
      const numbers = await knex
        .select("*")
        .from("numbers")
        .where({ order_id: order.id });

      return res.status(200).json({ order, numbers });
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

  async UpdateOrder(req, res) {
    const { payment, order } = req.body;

    try {
      await knex("orders").where({ id: order }).update({ status: payment });
      await knex("numbers").where({ order_id: id }).update({ status: payment });

      return res
        .status(200)
        .json({ message: "Alteração concluída com sucesso" });
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
