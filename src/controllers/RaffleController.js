const knex = require("../database/index");
const config = require("../configs/index");
const { isBefore } = require("date-fns");
const { v4: uuidv4 } = require("uuid");
const mercadopago = require("mercadopago");
mercadopago.configure({ access_token: config.payment_token });

module.exports = {
  async Store(req, res) {
    const {
      name,
      qtd_numbers,
      draw_date,
      draw_time,
      client_id,
      description,
      raffle_value,
      trophys,
    } = req.body;
    const { filename } = req.file;
    try {
      const default_configs = await knex.select("*").from("configs").first();
      const find_client = await knex
        .select("*")
        .from("clients")
        .where({ id: client_id })
        .first();
      const [id, identify] = await knex("raffles")
        .insert({
          identify: uuidv4(),
          name,
          qtd_numbers,
          draw_date,
          draw_time,
          client_id,
          description,
          thumbnail: filename,
          raffle_value,
          payment: "all",
        })
        .returning("id");
      const preferences = {
        notification_url:
          "https://webhook.site/640dcefb-f748-4993-8534-9a67ebecb0be", //alterar para a url de notificação de pagamento de criação de rifas
        items: [
          {
            title: `PA Rifas - Criação de Rifas: ${name}`,
            id: identify,
            currency_id: "BRL",
            picture_url:
              "https://www.mercadopago.com/org-img/MP3/home/logomp3.gif", //alterar para a url da thumbnail
            description: `PA Rifas - Criação de Rifas: ${name}`,
            quantity: 1,
            unit_price: parseFloat(default_configs.raffle_value),
          },
        ],
        payer: {
          name: find_client.name,
          email: find_client.email,
          identification: {
            type: "CPF",
            number: find_client.cpf,
          },
        },
        back_urls: {
          success: "https://www.success.com", //Redirecionar para a home do site
          failure: "http://www.failure.com", //Redirecionar para a criação de rifas
          pending: "http://www.pending.com", //Redirecionar para a home do site
        },
        payment_methods: {
          excluded_payment_types: [
            {
              id: "ticket",
            },
          ],
          installments: 1,
        },
      };
      console.log("IDENTIFY", identify);
      const trophysParse = JSON.parse(trophys);
      async function saveTrophys(trophy) {
        await knex("trophys").insert({
          raffle_id: id,
          title: trophy.order,
          description: trophy.desc,
        });
      }
      if (trophysParse.length !== 0) {
        trophysParse.forEach((element) => {
          saveTrophys(element);
        });
      }

      mercadopago.preferences
        .create(preferences)
        .then((data) => {
          const { response } = data;
          console.log("RESPONSE CREATE", response);
          const redirect_url = response.sandbox_init_point; //Em produção usar o init_point
          return res.status(201).json({
            message: "Rifa cadastrada com sucesso.",
            redirect_url,
          });
        })
        .catch((error) => {
          let erros = {
            status: "400",
            type: "Erro no cadastro",
            message: "Ocorreu um erro ao cadastrar o sorteio",
            err: "Payment error",
          };
          return res.status(400).json(erros);
        });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao cadastrar o sorteio",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async ManageByAdmin(req, res) {
    const { id } = req.params;
    const { status, justify } = req.body;

    try {
      await knex("raffles").where({ id: id }).update({ status, justify });
      return res.status(201).json({ message: "Alteração concluída com êxito" });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao editar as informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async ManageByClient(req, res) {
    const { id } = req.params;
    const { status, justify } = req.body;

    try {
      await knex("raffles").where({ id: id }).update({ status, justify });
      return res.status(201).json({ message: "Alteração concluída com êxito" });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao editar as informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async ChangeDate(req, res) {
    const { id } = req.params;
    const { draw_date } = req.body;

    try {
      const date = await knex("raffles")
        .where({ id: id })
        .update({ draw_date })
        .returning("*");
      return res
        .status(201)
        .json({ message: "Alteração concluída com êxito", date });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao editar as informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async Show(req, res) {
    try {
      const raffles = await knex
        .select([
          "raffles.id",
          "raffles.name",
          "raffles.identify",
          "raffles.qtd_numbers",
          "raffles.draw_date",
          "raffles.raffle_value",
          "raffles.description",
          "raffles.justify",
          "raffles.status",
          "raffles.thumbnail",
          "clients.id as id_client",
          "clients.name as name_client",
          "clients.phone as phone_client",
        ])
        .from("raffles")
        .where("status", "open")
        .innerJoin("clients", "clients.id", "raffles.client_id")
        .orderBy("raffles.updated_at", "desc");
      const url = `${config.url}`;
      return res.status(200).json({ raffles, url });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar as informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async FindById(req, res) {
    const { id } = req.params;
    try {
      const raffles = await knex
        .select([
          "raffles.id",
          "raffles.name",
          "raffles.identify",
          "raffles.qtd_numbers",
          "raffles.draw_date",
          "raffles.raffle_value",
          "raffles.description",
          "raffles.justify",
          "raffles.status",
          "raffles.thumbnail",
          "clients.id as id_client",
          "clients.name as name_client",
          "clients.cpf as cpf_client",
          "clients.city as client_city",
          "clients.state as client_state",
        ])
        .from("raffles")
        .where("raffles.identify", id)
        .innerJoin("clients", "clients.id", "raffles.client_id")
        .orderBy("raffles.updated_at", "desc");
      const trophys = await knex
        .select("*")
        .from("trophys")
        .where({ raffle_id: raffles[0].id });
      const raffle = raffles[0];
      return res.status(200).json({ raffle, trophys });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar as informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async Find(req, res) {
    try {
      const raffles = await knex
        .select([
          "raffles.id",
          "raffles.name",
          "raffles.identify",
          "raffles.qtd_numbers",
          "raffles.draw_date",
          "raffles.raffle_value",
          "raffles.description",
          "raffles.justify",
          "raffles.status",
          "raffles.thumbnail",
          "clients.id as id_client",
          "clients.name as name_client",
          "clients.cpf as cpf_client",
        ])
        .from("raffles")
        .where("status", "open")
        .innerJoin("clients", "clients.id", "raffles.client_id")
        .orderBy("raffles.updated_at", "desc");
      return res.status(200).json(raffles);
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar as informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async ShowRaffles(req, res) {
    try {
      const raffles = await knex
        .select([
          "raffles.id",
          "raffles.name",
          "raffles.identify",
          "raffles.qtd_numbers",
          "raffles.draw_date",
          "raffles.raffle_value",
          "raffles.description",
          "raffles.justify",
          "raffles.status",
          "raffles.thumbnail",
          "clients.id as id_client",
          "clients.name as name_client",
          "clients.phone as phone_client",
        ])
        .from("raffles")
        .whereNotIn("status", ["refused", "waiting"])
        .innerJoin("clients", "clients.id", "raffles.client_id")
        .orderBy("raffles.updated_at", "desc");
      const totalNumbers = await knex("numbers").where({
        status: "paid_out",
      });
      let numbersRaffle = raffles.map((element) => {
        const result = totalNumbers.filter(
          (obj) => obj.raffle_id === element.id
        );
        return { raffle_id: element.id, count: result.length };
      });
      return res.status(200).json({ raffles, numbers: numbersRaffle });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar as informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async FindDesk(req, res) {
    try {
      const raffles = await knex
        .select([
          "raffles.id",
          "raffles.name",
          "raffles.identify",
          "raffles.qtd_numbers",
          "raffles.draw_date",
          "raffles.raffle_value",
          "raffles.pix_keys",
          "raffles.bank_transfer",
          "raffles.description",
          "raffles.justify",
          "raffles.refused",
          "raffles.status",
          "raffles.number_drawn",
          "raffles.thumbnail",
          "clients.id as id_client",
          "clients.name as name_client",
          "clients.cpf as cpf_client",
        ])
        .from("raffles")
        .innerJoin("clients", "clients.id", "raffles.client_id")
        .orderBy("raffles.updated_at", "desc");
      const url = config.url;
      return res.status(200).json({ raffles, url });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar as informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async FindNumbers(req, res) {
    const { id } = req.params;

    try {
      const raffle = await knex
        .select("id")
        .from("raffles")
        .where("identify", id)
        .first();
      const validate = await knex
        .select("*")
        .from("numbers")
        .where({ raffle_id: raffle.id });
      async function revalidate(id) {
        await knex("numbers").where({ id: id }).del();
      }
      await validate.forEach((element) => {
        if (isBefore(new Date(element.expiration_date), new Date())) {
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
        .where({ raffle_id: raffle.id })
        .innerJoin("clients", "clients.id", "numbers.client_id");

      return res.status(200).json({ numbers });
    } catch (error) {
      console.log(error);
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar as informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async FindNumbersByAdmin(req, res) {
    const { id } = req.params;

    try {
      const validate = await knex
        .select("*")
        .from("numbers")
        .where({ raffle_id: id });
      async function revalidate(id) {
        await knex("numbers").where({ id: id }).del();
      }
      await validate.forEach((element) => {
        if (isBefore(new Date(element.expiration_date), new Date())) {
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
        .where({ raffle_id: id })
        .innerJoin("clients", "clients.id", "numbers.client_id")
        .orderBy("number");

      return res.status(200).json(numbers);
    } catch (error) {
      console.log(error);
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar as informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async FindNumbersByClient(req, res) {
    const { id, raffle } = req.params;
    try {
      const validate = await knex
        .select("*")
        .from("numbers")
        .where({ client_id: id, raffle_id: raffle });
      async function revalidate(id) {
        await knex("numbers").where({ id: id }).del();
      }
      await validate.forEach((element) => {
        if (isBefore(new Date(element.expiration_date), new Date())) {
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
        .where({ client_id: id, raffle_id: raffle })
        .innerJoin("clients", "clients.id", "numbers.client_id")
        .orderBy("number");

      return res.status(200).json(numbers);
    } catch (error) {
      console.log(error);
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar as informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async Cancel(req, res) {
    const { id } = req.params;
    const { justify } = req.body;
    try {
      const raffle = await knex("raffles")
        .where("id", id)
        .update({ justify, status: "cancel" })
        .returning("*");
      return res
        .status(201)
        .json({ message: "Sorteio cancelado com sucesso", raffle });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao editar as informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async Drawn(req, res) {
    const { id } = req.params;

    try {
      const raffle = await knex
        .select([
          "numbers.id",
          "numbers.number",
          "clients.id as id_client",
          "clients.name as name_client",
          "clients.phone as phone_client",
          "clients.email as email_client",
        ])
        .from("numbers")
        .where({ raffle_id: id, status: "paid_out" })
        .innerJoin("clients", "clients.id", "numbers.client_id");
      const random = raffle[Math.floor(Math.random() * raffle.length)];
      const newRaffle = await knex("raffles")
        .where({ id: id })
        .update({
          number_drawn: random.number,
          client_drawn: JSON.stringify(random),
          status: "drawn",
        })
        .returning("*");
      return res.status(200).json({ random, newRaffle });
    } catch (error) {
      console.log(error);
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao sortear",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },
};
