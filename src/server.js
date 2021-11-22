require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes/index");
const app = express();
const path = require("path");
const InitController = require("./controllers/InitController");

app.use(express.json());
app.use(cors());
app.use(routes);
app.use("/img", express.static(path.resolve(__dirname, "..", "uploads")));

const port = process.env.PORT || 3333;

app.listen(port, function () {
  InitController.Create();
  console.log(`App rodando na porta ${port}, para cancelar pressione CTRL+C`);
});
