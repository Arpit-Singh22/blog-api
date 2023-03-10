const express = require("express")
const { categoryGetCtrl, categoryDeleteCtrl, categoryUpdateCtrl, categoryCreateCtrl, fetchcategoryGetCtrl } = require("../../controllers/categories/categoryCtrl")
const isLogin = require("../../middleware/isLogin")

const categoryRouter = express.Router()


// POST/api/v1/categories
categoryRouter.post("/", isLogin, categoryCreateCtrl)

// fetch allo/api/v1/categories/:
categoryRouter.get("/", fetchcategoryGetCtrl)

// GET/api/v1/categories/:id
categoryRouter.get("/:id", categoryGetCtrl)

// DELETE/api/v1/categories/:id
categoryRouter.delete("/:id", isLogin, categoryDeleteCtrl)

// PUT/api/v1/categories/:id
categoryRouter.put("/:id", isLogin, categoryUpdateCtrl)



module.exports = categoryRouter