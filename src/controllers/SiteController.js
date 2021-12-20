const knex = require("../database/index");
const date_fns = require("date-fns");

module.exports = {
  async Show(req, res) {
    try {
      const configs = await knex.select("*").from("configs").first();
      const numbers = await knex
        .select("*")
        .from("numbers")
        .where({ status: "paid_out" });
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
        ])
        .from("raffles")
        .where("status", "open")
        .innerJoin("clients", "clients.id", "raffles.client_id")
        .orderBy("raffles.updated_at", "desc");
      let numbersRaffle = await raffles.map((element) => {
        const result = numbers.filter((obj) => obj.raffle_id === element.id);
        return { raffle_id: element.id, count: result.length };
      });

      return res.status(200).json({ configs, raffles, numbersRaffle });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar os dados",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async RaffleParticipant(req, res) {
    const { id } = req.params;

    try {
      const raffle = await knex("raffles").where({ identify: id }).first();
      const trophys = await knex("trophys").where({ raffle_id: raffle.id });

      const validate = await knex
        .select("*")
        .from("orders")
        .where({ raffle_id: raffle.id, status: "reserved" });
      async function revalidate(id) {
        await knex("orders").where({ id: id }).del();
        await knex("numbers").where({ order_id: id }).del();
      }
      await validate.forEach((element) => {
        if (date_fns.isBefore(new Date(element.expiration_date), new Date())) {
          revalidate(element.id);
        }
      });

      const orders = await knex("orders").where({ raffle_id: raffle.id });
      const numbers = await knex("numbers").where({
        raffle_id: raffle.id,
      });

      return res.status(200).json({ raffle, trophys, orders, numbers });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },

  async RaffleAdmin(req, res) {
    const { id } = req.params;

    try {
      const raffle = await knex("raffles").where({ identify: id }).first();
      const trophys = await knex("trophys").where({ raffle_id: raffle.id });
      const orders = await knex("orders").where({
        raffle_id: raffle.id,
        status: "paid_out",
      });
      const numbersPaid = await knex("numbers")
        .where({
          raffle_id: raffle.id,
          status: "paid_out",
        })
        .count();
      const numbersReserved = await knex("numbers")
        .where({
          raffle_id: raffle.id,
          status: "reserved",
        })
        .count();
      const reserved = numbersReserved[0].count;
      const numbers = numbersPaid[0].count;
      return res
        .status(200)
        .json({ raffle, trophys, orders, numbers, reserved });
    } catch (error) {
      let erros = {
        status: "400",
        type: "Erro no cadastro",
        message: "Ocorreu um erro ao buscar informações",
        err: error.message,
      };
      return res.status(400).json(erros);
    }
  },
};
