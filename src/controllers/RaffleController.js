const knex = require("../database/index");
const config = require("../configs/index");
const { isBefore } = require("date-fns");
const { v4: uuidv4 } = require("uuid");

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
      goal,
      tax_value,
      isDiscounted,
      coupon,
    } = req.body;
    const { filename } = req.file;
    try {
      const [id] = await knex("raffles")
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
          goal,
          status: "open",
          tax_value,
        })
        .returning("id");
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

      if (isDiscounted === "yes") {
        await knex("coupon")
          .where({ identify: coupon })
          .update({ status: "used" });
        await knex("raffles")
          .where({ id: id })
          .update({ coupon_identify: coupon });
      }

      return res.status(201).json({
        message: "Rifa cadastrada com sucesso.",
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
      return res.status(201).json({ message: "Altera????o conclu??da com ??xito" });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao editar as informa????es",
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
      return res.status(201).json({ message: "Altera????o conclu??da com ??xito" });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao editar as informa????es",
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
        .json({ message: "Altera????o conclu??da com ??xito", date });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao editar as informa????es",
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
          "raffles.goal",
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
        message: "Ocorreu um erro ao buscar as informa????es",
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
          "raffles.goal",
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
      const numbers = await knex
        .select("*")
        .from("numbers")
        .where({ raffle_id: raffles[0].id, status: "paid_out" });
      const raffle = raffles[0];
      return res.status(200).json({ raffle, trophys, numbers });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar as informa????es",
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
          "raffles.goal",
          "clients.id as id_client",
          "clients.name as name_client",
          "clients.cpf as cpf_client",
        ])
        .from("raffles")
        .innerJoin("clients", "clients.id", "raffles.client_id")
        .orderBy("raffles.updated_at", "desc");
      return res.status(200).json(raffles);
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar as informa????es",
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
          "raffles.goal",
          "clients.id as id_client",
          "clients.name as name_client",
          "clients.phone as phone_client",
        ])
        .from("raffles")
        .where("status", "open")
        .innerJoin("clients", "clients.id", "raffles.client_id")
        .orderBy("raffles.updated_at", "desc");

      return res.status(200).json({ raffles });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar as informa????es",
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
          "raffles.goal",
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
        message: "Ocorreu um erro ao buscar as informa????es",
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
        .from("orders")
        .where({ raffle_id: raffle.id, status: "reserved" });

      async function revalidate(id) {
        await knex("orders").where({ id: id }).del();
        await knex("numbers").where({ order_id: id }).del();
      }
      await validate.forEach((element) => {
        if (isBefore(new Date(element.expiration_date), new Date())) {
          revalidate(element.id);
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
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar as informa????es",
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
        message: "Ocorreu um erro ao buscar as informa????es",
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
        message: "Ocorreu um erro ao buscar as informa????es",
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
        message: "Ocorreu um erro ao editar as informa????es",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async Drawn(req, res) {
    const { id, trophy, number } = req.params;
    const numberInt = parseInt(number);
    try {
      const raffle = await knex
        .select("*")
        .from("numbers")
        .where({ raffle_id: id, status: "paid_out", number: numberInt })
        .first();

      if (!raffle) {
        let erros = {
          status: "400",
          type: "Sorteio n??o Realizado",
          message: "N??mero n??o encontrado, insira outro n??mero",
          err: "N??mero n??o encontrado",
        };
        return res.status(400).json(erros);
      }

      if (raffle.status === "reserved") {
        let erros = {
          status: "400",
          type: "Sorteio n??o Realizado",
          message: "N??mero n??o foi pago",
          err: "N??mero n??o encontrado",
        };
        return res.status(400).json(erros);
      }

      const client = await knex("clients")
        .where({ id: raffle.client_id })
        .first();

      const [myTrophy] = await knex("trophys")
        .where({ id: trophy })
        .update({
          number: number,
          name_client: JSON.stringify(client),
          client_identify: client.identify,
          status: "drawn",
        })
        .returning("*");

      const findTrophys = await knex("trophys").where({
        raffle_id: id,
        status: "waiting",
      });

      if (!findTrophys.length) {
        const myRaffle = await knex("raffles").where({ id: id }).first();
        const finishOrders = await knex("orders").where({
          raffle_id: id,
          status: "paid_out",
        });
        let soma = finishOrders.reduce(function (total, numero) {
          return total + parseFloat(numero.discounted_value);
        }, 0);
        let calc = soma * (parseFloat(myRaffle.tax_value) / 100);
        const date = new Date();
        await knex("revenues").insert({
          raffle_id: id,
          value: calc,
          month: date.toLocaleString("pt-br", { month: "long" }),
          year: date.getFullYear().toString(),
        });
        await knex("raffles").where({ id: id }).update({
          status: "drawn",
        });
      }

      const newTrophys = await knex("trophys").where({ raffle_id: id });

      return res.status(200).json({ newTrophys, client, myTrophy });
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
