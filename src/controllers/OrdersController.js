const knex = require("../database/index");
const mercadopago = require("mercadopago");
const configs = require("../configs/index");

mercadopago.configure({
  access_token: configs.payment_token,
});

module.exports = {
  async PayOrder(req, res) {
    const { order } = req.params;
    const { payment_id, status } = req.body;

    try {
      const orderAct = await knex
        .select("*")
        .from("orders")
        .where({ id: parseInt(order) })
        .first();

      async function sendActivate(id) {
        await knex("numbers").where({ id: id }).update({ status: "paid_out" });
      }

      async function activateNumbers() {
        await orderAct.numbers.forEach((element) => {
          sendActivate(element.id);
        });
      }

      async function updateOrder(tax, discounted, payment) {
        await knex("orders")
          .where({ id: parseInt(order) })
          .update({
            pay_mode: payment,
            tax: tax,
            discounted_value: discounted,
            status: status === "approved" ? "paid_out" : "reserved",
          });
        if (status === "approved") {
          activateNumbers();
        }
      }

      mercadopago.payment
        .findById(payment_id)
        .then((response) => {
          const payType = response.body.payment_type_id;

          if (payType === "credit_card") {
            const calc = parseFloat(orderAct.value) * (configs.cardTax / 100);
            const rest = parseFloat(orderAct.value) - calc;
            updateOrder(calc, rest, "card");
          }

          if (payType === "pix") {
            const calc = parseFloat(orderAct.value) * (configs.pixTax / 100);
            const rest = parseFloat(orderAct.value) - calc;
            updateOrder(calc, rest, "pix");
          }

          return res.status(200).json({ message: "Pagamento ativado" });
        })
        .catch((error) => {
          let erros = {
            status: "400",
            type: "Erro na ativação do pagamento",
            message: "Ocorreu um erro",
            err: "Ocorreu um erro",
          };
          return res.status(400).json(erros);
        });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro na ativação do pagamento",
        message: "Ocorreu um erro",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },
};
