const express = require('express')
const storage = require('../../config/cloudinary')
const multer = require('multer')
const { postCreateCtrl,
    postDetailCtrl,
    postDeleteCtrl,
    postUpdateCtrl,
    fetchPostCtrl,
    toggleLikesPostCtrl,
    toggleDislikesPostCtrl } = require('../../controllers/posts/postsCtrl')
const isLogin = require('../../middleware/isLogin')

const postRouter = express.Router()

//file upload middleware
const upload = multer({ storage })

// POST/api/v1/posts
postRouter.post("/", isLogin, upload.single('image'), postCreateCtrl)

// fetch post controller
postRouter.get("/", isLogin, fetchPostCtrl)

// toggle like post controller
postRouter.get("/likes/:id", isLogin, toggleLikesPostCtrl)

// toggle dislike post controller
postRouter.get("/dislikes/:id", isLogin, toggleDislikesPostCtrl)

// GET/api/v1/posts/:id
postRouter.get("/:id", isLogin, postDetailCtrl)

// DELETE/api/v1/posts/:id
postRouter.delete("/:id", isLogin, postDeleteCtrl)

// PUT/api/v1/posts/:id
postRouter.put("/:id", isLogin, upload.single('image'), postUpdateCtrl)


module.exports = postRouter