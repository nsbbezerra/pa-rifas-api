const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerConfig = require("../configs/multer");

const PetitionController = require("../controllers/App/PetitionController");

/** PETITIONS */
router.post("/petitionsWithoutThumb", PetitionController.StoreWithoutThumb);

module.exports = router;
