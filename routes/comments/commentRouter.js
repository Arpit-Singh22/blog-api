const express = require("express")
const { commentCreateCtrl, commentDeleteCtrl, commentUpdateCtrl } = require("../../controllers/comments/commentCtrl")
const isLogin = require("../../middleware/isLogin")

const commentRouter = express.Router()


// POST/api/v1/comments
commentRouter.post("/:id", isLogin, commentCreateCtrl)

// PUT/api/v1/comments/:id
commentRouter.put("/:id", isLogin, commentUpdateCtrl)

// DELETE/api/v1/comments/:id
commentRouter.delete("/:id", isLogin, commentDeleteCtrl)



module.exports = commentRouter