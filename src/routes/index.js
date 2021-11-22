const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerConfig = require("../configs/multer");

const ClientController = require("../controllers/ClientController");
const ConfigsController = require("../controllers/ConfigsController");
const SiteController = require("../controllers/SiteController");
const RaffleController = require("../controllers/RaffleController");
const NumbersController = require("../controllers/NumbersController");
const MyDataController = require("../controllers/MyDataController");
const RaffleEditController = require("../controllers/RaffleEditController");

/** CLIENTES */
router.post("/clients", ClientController.Store);
router.post("/login", ClientController.Login);
router.put("/bannadmin/:id", ClientController.SetBannAdmin);
router.put("/bannclient/:id", ClientController.SetBannClient);
router.put("/clients/:id", ClientController.Update);
router.get("/clients", ClientController.Show);

/** CONFIGS */
router.post("/configs", ConfigsController.Store);
router.get("/configs", ConfigsController.Show);
router.put("/configs/:id", ConfigsController.Update);

/** SITE */
router.get("/site", SiteController.Show);

/** RAFFLES */
router.post(
  "/raffle",
  multer(multerConfig).single("thumbnail"),
  RaffleController.Store
);
router.put(
  "/banner/:id",
  multer(multerConfig).single("banner"),
  RaffleController.StoreBanner
);
router.get("/raffles", RaffleController.Show);
router.get("/findRaffle", RaffleController.Find);
router.get("/numbers/:id", RaffleController.FindNumbers);
router.get("/numbersAdmin/:id", RaffleController.FindNumbersByAdmin);
router.get(
  "/numbersClient/:id/raffle/:raffle",
  RaffleController.FindNumbersByClient
);
router.get("/findDesk", RaffleController.FindDesk);
router.put("/manAdmin/:id", RaffleController.ManageByAdmin);
router.get("/showRaffles", RaffleController.ShowRaffles);
router.put("/updateDate/:id", RaffleController.ChangeDate);
router.put("/blockRaffle/:id", RaffleController.Cancel);
router.put("/drawn/:id", RaffleController.Drawn);

/** NUMEROS */
router.post("/numbers", NumbersController.Buy);
router.put("/numbersActive/:id", NumbersController.Update);

/** MEUS DADOS */
router.get("/mydata", MyDataController.Show);
router.get("/findRafflesAdmin/:id", MyDataController.Admin);
router.get("/findRafflesClient/:id", MyDataController.Client);

/** RAFFLE EDIT */
router.put(
  "/raffleEditImage/:id",
  multer(multerConfig).single("thumbnail"),
  RaffleEditController.EditImage
);
router.put("/raffleEditInfo/:id", RaffleEditController.UpdateInfo);
router.delete("/raffleDelete/:id", RaffleEditController.RemoveRaffle);

module.exports = router;
