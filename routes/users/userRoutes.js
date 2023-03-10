const express = require('express')
const userRouter = express.Router()
const storage = require('../../config/cloudinary')
const { userRegisterCtrl,
    userLoginCtrl,
    userCtrl,
    userProfileCtrl,
    userDeleteCtrl,
    userUpdateCtrl,
    profilePhotoUploadCtrl,
    whoViewedMyProfileCtrl,
    followingCtrl,
    unFollowCtrl,
    blockUserCtrl,
    unblockUserCtrl,
    adminblockUserCtrl,
    adminUnblockUserCtrl,
    userUpdatePasswordCtrl,
} = require('../../controllers/users/userCtrl')
const isLogin = require('../../middleware/isLogin')

const multer = require("multer")
const isAdmin = require('../../middleware/isAdmin')

// where we want to accept to file pass multer as a middleware

// instance of multer
const upload = multer({ storage })

// POST/api/v1/users/register
userRouter.post("/register", userRegisterCtrl)

// POST/api/v1/users/login
userRouter.post("/login", userLoginCtrl)

// GET/api/v1/users
userRouter.get("/", userCtrl)

// GET/api/v1/users/:id
userRouter.get("/profile/", isLogin, userProfileCtrl)


// DELETE/api/v1/users/:id
userRouter.delete("/delete-account", isLogin, userDeleteCtrl)

// PUT/api/v1/users/:id
userRouter.put("/", isLogin, userUpdateCtrl)

// GET/api/v1/users/profile-viewers/:id
userRouter.get("/profile-viewers/:id", isLogin, whoViewedMyProfileCtrl)

// GET/api/v1/users/following/:id
userRouter.get("/following/:id", isLogin, followingCtrl)

// GET/api/v1/users/unfollow/:id
userRouter.get("/unfollow/:id", isLogin, unFollowCtrl)

// GET/api/v1/users/blocked/:id
userRouter.get("/blocked/:id", isLogin, blockUserCtrl)

// GET/api/v1/users/unblock/:id
userRouter.get("/unblock/:id", isLogin, unblockUserCtrl)

// PUT/api/v1/users/adminblock/:id
userRouter.put("/admin-block/:id", isLogin, isAdmin, adminblockUserCtrl)

// PUT/api/v1/users/adminUnblock/:id
userRouter.put("/admin-unblock/:id", isLogin, isAdmin, adminUnblockUserCtrl)

// PUT/api/v1/users/update-password
userRouter.put("/update-password", isLogin, userUpdatePasswordCtrl)


// Post/api/v1/users/:id
userRouter.post("/profile-photo-upload",
    isLogin,                                // middleware
    upload.single('profile'),               // middleware
    profilePhotoUploadCtrl
)

module.exports = userRouter