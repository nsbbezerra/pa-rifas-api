const knex = require("../database/index");
const configs = require("../configs/index");
const mercadopago = require("mercadopago");

mercadopago.configure({ access_token: configs.payment_token });

module.exports = {
  async PayRaffle(req, res) {
    const { id, method, payer_id, amount } = req.body;

    try {
      const client = await knex
        .select("*")
        .from("clients")
        .where({ id: payer_id })
        .first();
      const raffle = await knex
        .select("*")
        .from("raffles")
        .where({ id: id })
        .first();
      const cpf_split_pointer = client.cpf.replace(".", "");
      const cpf_splited = cpf_split_pointer.replace("-", "");
      const options = {
        transaction_amount: Number(amount),
        payment_method_id: "pix",
        payer: {
          first_name: client.name,
          email: "nsbbezerra@hotmail.com", //Mudar para o email que vem da tabela
          identification: {
            type: "cpf",
            number: cpf_splited,
          },
        },
        description: "Pagamento PA Rifas, criação de rifas",
        notification_url: `http://meusite.site/activate/raffle/${raffle.identify}`,
      };
      if (method === "pix") {
        mercadopago.payment
          .create(options)
          .then(function (data) {
            const { response } = data;
            const transaction_id = response.id;
            const transaction_qr_code =
              response.point_of_interaction.transaction_data.qr_code;
            const transaction_qr_code_base64 =
              response.point_of_interaction.transaction_data.qr_code_base64;
            knex("raffles")
              .where({ id: id })
              .update({ transaction_id: transaction_id });
            return res
              .status(200)
              .json({ transaction_qr_code, transaction_qr_code_base64 });
          })
          .catch((error) => {
            res.status(400).send(error);
          });
      }
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no login",
        message: "Ocorreu um erro ao efetuar o pagamento",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },
};
