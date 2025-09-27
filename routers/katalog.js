const express = require("express");
const router = express.Router();
const { getAllKatalog, getKatalogById } = require("../controllers/katalog");

router.get("/", getAllKatalog);
router.get("/:id", getKatalogById);

module.exports = router;
