const express = require("express");
const router = express.Router();

const categoryController = require("./../controllers/categoryController");

router
  .route("/")
  .get(categoryController.getAllCategories)
  .post(categoryController.createOneCategory);

router
  .route("/:slug")
  .get(categoryController.getOneCategory)
  .patch(categoryController.updateOneCategory)
  .delete(categoryController.deleteOneCategory);

module.exports = router;
