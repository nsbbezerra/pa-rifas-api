const knex = require("../database/index");
const date_fns = require("date-fns");
const mercadopago = require("mercadopago");
const configs = require("../configs/index");
const { v4: uuidv4 } = require("uuid");

mercadopago.configure({
  access_token: configs.payment_token,
});

module.exports = {
  async Buy(req, res) {
    const { raffle_id, client_id, numbers, orderValue } = req.body;
    const expiration = date_fns.addHours(new Date(), 24);

    try {
      const client = await knex
        .select("*")
        .from("clients")
        .where({ id: client_id })
        .first();

      const [order] = await knex("orders")
        .insert({
          identify: uuidv4(),
          raffle_id: raffle_id,
          client_id: client_id,
          status: "reserved",
          pay_mode: "pix", // não será obrigatório remover depois
          expiration_date: expiration,
          value: orderValue,
        })
        .returning("*");

      async function SaveNumber(num) {
        await knex("numbers").insert({
          raffle_id,
          client_id,
          expiration_date: expiration,
          number: num,
          status_drawn: "open",
          order_id: order.id,
          status: "reserved",
        });
      }
      await numbers.forEach((element) => {
        SaveNumber(parseInt(element));
      });
      const participant = await knex
        .select("*")
        .from("participant")
        .where({ raffle_id: raffle_id, client_id: client_id })
        .first();
      if (!participant) {
        await knex("participant").insert({
          raffle_id: raffle_id,
          client_id: client_id,
        });
      }

      let preference = {
        external_reference: order.identify,
        items: [
          {
            title: `Compra de números PA Rifas, Rifa número: ${raffle_id}`,
            unit_price: parseFloat(orderValue),
            quantity: 1,
          },
        ],
        payer: {
          email: client.email,
          first_name: client.name,
        },
        back_urls: {
          success: `${configs.site_url}/finalizar`,
          failure: `${configs.site_url}/finalizar`,
          pending: `${configs.site_url}/finalizar`,
        },
        auto_return: "approved",
        payment_methods: {
          excluded_payment_types: [
            {
              id: "ticket",
            },
            {
              id: "paypal",
            },
            {
              id: "debit_card",
            },
          ],
          installments: 1,
        },
      };

      mercadopago.preferences
        .create(preference)
        .then((response) => {
          const url = response.body.sandbox_init_point; //mudar em produção para init_point
          return res.status(201).json({
            message: "Números reservados com sucesso.",
            url,
          });
        })
        .catch((error) => {
          let erros = {
            status: "400",
            type: "Erro no login",
            message: "Ocorreu um erro ao reservar os números",
            err: "Erro no pagamento",
          };
          return res.status(400).json(erros);
        });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no login",
        message: "Ocorreu um erro ao reservar os números",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async Find(req, res) {
    const { id } = req.body;
    try {
      const raffle = await knex
        .select("*")
        .from("raffles")
        .where({ identify: id })
        .first();
      const validate = await knex
        .select("*")
        .from("orders")
        .where({ raffle_id: raffle.id });
      async function revalidate(id) {
        await knex("numbers").where({ id: id }).update({ status: "free" });
      }
      await validate.forEach((element) => {
        if (date_fns.isAfter(new Date(element.expiration_date), new Date())) {
          revalidate(element.id);
        }
      });
      const numbers = await knex
        .select("*")
        .from("numbers")
        .where({ raffle_id: id })
        .innerJoin("clients", "clients.id", "numbers.client_id");
      return res.status(200).json({ numbers, raffle });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no login",
        message: "Ocorreu um erro ao buscar os números",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async Update(req, res) {
    const { id } = req.params;
    try {
      const number = await knex
        .select("*")
        .from("numbers")
        .where({ id: id })
        .first();
      await knex("numbers").where({ id: id }).update({ status: "paid_out" });
      const validate = await knex
        .select("*")
        .from("numbers")
        .where({ raffle_id: number.raffle_id });
      async function revalidate(id) {
        await knex("numbers").where({ id: id }).del();
      }
      await validate.forEach((element) => {
        if (date_fns.isBefore(new Date(element.expiration_date), new Date())) {
          if (element.status === "reserved") {
            revalidate(element.id);
          }
        }
      });
      const numbers = await knex
        .select([
          "numbers.id",
          "numbers.raffle_id",
          "numbers.status",
          "numbers.number",
          "clients.name",
          "clients.id as id_client",
        ])
        .from("numbers")
        .where({ raffle_id: number.raffle_id })
        .innerJoin("clients", "clients.id", "numbers.client_id")
        .orderBy("number");
      return res
        .status(201)
        .json({ message: "Número ativado com sucesso", numbers });
    } catch (error) {
      console.log(error);
      let erros = {
        status: "400",
        type: "Erro no login",
        message: "Ocorreu um erro ao editar os números",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },
};
