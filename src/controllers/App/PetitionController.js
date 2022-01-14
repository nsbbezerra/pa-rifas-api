const knex = require("../../database/index");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async StoreWithoutThumb(req, res) {
    const {
      name,
      qtd_numbers,
      goal,
      client_name,
      client_cpf,
      client_phone,
      client_email,
      draw_date,
      draw_time,
      raffle_value,
      description,
      trophies,
    } = req.body;

    try {
      const [petition] = await knex("petition")
        .insert({
          name,
          identify: uuidv4(),
          qtd_numbers,
          goal,
          client_name,
          client_cpf,
          client_phone,
          client_email,
          draw_date,
          draw_time,
          raffle_value,
          description,
          trophies,
        })
        .returning("*");
      console.log(petition);

      return res
        .status(201)
        .json({ message: "Solicitação concluída com sucesso", petition });
    } catch (error) {
      next(error);
    }
  },
};
