const knex = require("../database/index");
const uniqid = require("uniqid");
const config = require("../configs/index");
const { isBefore } = require("date-fns");

module.exports = {
  async Store(req, res) {
    const {
      name,
      qtd_numbers,
      draw_date,
      draw_time,
      client_id,
      pix_keys,
      bank_transfer,
      description,
      raffle_value,
    } = req.body;
    const { filename } = req.file;
    try {
      const [id] = await knex("raffles")
        .insert({
          identify: uniqid("sorteio-"),
          name,
          qtd_numbers,
          draw_date,
          draw_time,
          client_id,
          pix_keys,
          bank_transfer,
          description,
          thumbnail: filename,
          raffle_value,
        })
        .returning("id");
      return res.status(201).json({
        message: "Sorteio cadastrado com sucesso, aguarde a liberação",
        id,
      });
    } catch (error) {
      console.log(error);
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao cadastrar o sorteio",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async StoreBanner(req, res) {
    const { id } = req.params;
    const { filename } = req.file;

    try {
      await knex("raffles").where({ id: id }).update({ banner: filename });
      return res.status(201).json({ message: "Banner inserido com sucesso" });
    } catch (error) {
      console.log(error);
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao cadastrar o banner do sorteio",
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
          "clients.phone as phone_client",
        ])
        .from("raffles")
        .whereNotIn("status", ["refused", "waiting"])
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
