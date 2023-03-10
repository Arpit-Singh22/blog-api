// bcryptjs@2.4.3
const User = require("../../model/User/User")
const bcrypt = require("bcryptjs")
const generateToken = require("../../utils/generateToken")
const getTokenFromHeader = require("../../utils/getTokenFromHeader").default
const appErr = require("../../utils/appErr")
const { populate } = require("../../model/Post/Post")
const Post = require("../../model/Post/Post")
const Category = require("../../model/Catogories/Category")
const Comment = require("../../model/Comment/Comment")


//Register
const userRegisterCtrl = async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body
    try {
        // check if email exist
        const userFound = await User.findOne({ email })
        if (userFound) {
            return next(appErr('User Already Exist', 500))
        }

        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // create the user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        })
        res.json({
            status: 'Success',
            data: user,
        })
    } catch (error) {
        next(appErr(error.message))
    }
}

//Login
const userLoginCtrl = async (req, res, next) => {
    const { email, password } = req.body
    try {
        // Check if email exist
        const userFound = await User.findOne({ email })
        if (!userFound) {
            return next(appErr("Invalid login Credentials"))
        }

        // verify password
        const isPasswordMatched = await bcrypt.compare(password, userFound.password)
        // return true / false

        if (!isPasswordMatched) {
            return next(appErr("Invalid login Credentials"))
        }

        res.json({
            status: 'Success',
            data: {
                firstName: userFound.firstName,
                lastName: userFound.lastName,
                email: userFound.email,
                isAdmin: userFound.isAdmin,
                token: generateToken(userFound._id)
            },
        })
    } catch (error) {
        next(appErr(error.message))
    }
}

// who view my profile
const whoViewedMyProfileCtrl = async (req, res, next) => {
    try {
        //1. Find the original owner
        const user = await User.findById(req.params.id)
        //2. Find the user who viewed the original user
        const userWhoViewed = await User.findById(req.userAuth)

        //3. check if original and whoviewed are found
        if (user && userWhoViewed) {
            //4. check if userWhoViewed is already in the users viewwers array
            const isUserAlreadyViewed = user.viewers.find
                (viewer => viewer.toString() === userWhoViewed._id.toString())

            if (isUserAlreadyViewed) {
                return next(appErr('You already viewed this profile'))
            } else {
                //5. push the userWhoViewed to the original user's viewers array
                user.viewers.push(userWhoViewed._id)
                //6. save the user
                await user.save()
                res.json({
                    status: 'Success',
                    data: "You have succesfully viewed this profile"
                })
            }
        }

    } catch (error) {
        next(appErr(error.message))
    }
}

// Following
const followingCtrl = async (req, res, next) => {
    try {
        //1. find the user to follow
        const userToFollow = await User.findById(req.params.id)
        //2. find the user who is following
        const userWhoFollowed = await User.findById(req.userAuth)

        //3. check if user and userwhofollowed are found
        if (userToFollow && userWhoFollowed) {
            // 4. check if userwhoFollowed is already in the user's followers array
            const isUserAlreadyFollowed = userToFollow.following.find(follower => {
                follower.toString() === userWhoFollowed._id.toString()
            })
            if (isUserAlreadyFollowed) {
                return next(appErr("You already followed this user"))
            }
            else {
                //5. push userWhoFollowed into the user's followers array
                userToFollow.followers.push(userWhoFollowed._id)
                // push userTofollow to the userWhoFollowed's following array
                userWhoFollowed.following.push(userToFollow._id)

                //save
                await userWhoFollowed.save()
                await userToFollow.save()

                res.json({
                    status: 'Success',
                    data: "You have successfully followed this user"
                })
            }
        }

    } catch (error) {
        res.json(error.message)
    }
}

// Unfollow
const unFollowCtrl = async (req, res, next) => {
    try {
        //1. Find the user to unfollow
        const userToBeUnfollowed = await User.findById(req.params.id)
        //2. Find the user who is unFollowing
        const userWhoUnfollowed = await User.findById(req.userAuth)

        //. Check if user and UserWhoUnfollowed are found
        if (userToBeUnfollowed && userWhoUnfollowed) {
            //4. check if userWhoUnfollowed is already in the user's followeres array
            const isUserAlreadyFollowed = userToBeUnfollowed.followers.find(follower =>
                follower.toString() === userWhoUnfollowed._id.toString()
            )

            //if user hasn't followed the but trying to unfollow
            if (!isUserAlreadyFollowed) {
                return next(appErr("You have not followed this user"))
            }
            else {
                //5. Remove userWhoUnfollowed form the users' following array
                userToBeUnfollowed.followers = userToBeUnfollowed.followers.filter(
                    follower => follower.toString() !== userWhoUnfollowed._id.toString()
                )
                //6. Save the user
                await userToBeUnfollowed.save()
                // 7. remove the userToBeUnfollowed form the userWhoUnfollowed's following array
                userWhoUnfollowed.following = userWhoUnfollowed.following.filter(
                    following => following.toString() !== userToBeUnfollowed._id.toString()
                )
                //8.  save the user
                await userWhoUnfollowed.save()
                res.json({
                    status: 'Success',
                    data: "You have successfully Unfollowed this user"
                })
            }
        }

    } catch (error) {
        next(appErr(error.message))
    }
}
// all users
const userCtrl = async (req, res, next) => {
    try {
        const users = await User.find({})
        res.json({
            status: 'Success',
            data: users,
        })
    } catch (error) {
        next(appErr(error.message))
    }
}

// profile/:id
const userProfileCtrl = async (req, res) => {

    try {
        const user = await User.findById(req.userAuth)
        res.json({
            status: 'Success',
            data: user
        })
    } catch (error) {
        next(appErr(error.message))
    }
}

// Block
const blockUserCtrl = async (req, res, next) => {
    try {
        //1. Find the user to be blocked
        const userToBeBlocked = await User.findById(req.params.id)
        // 2. Find the user who is blocking
        const userWhoBlocked = await User.findById(req.userAuth)
        //3. Check if user to be blocked and userWhoBlocked are found
        if (userWhoBlocked && userToBeBlocked) {
            //4. check if userWhoBlocked is already in the user's blocked array
            const isUserAlreadyBlocked = userWhoBlocked.blocked.find(blocked =>
                blocked.toString() === userToBeBlocked._id.toString()
            )
            if (isUserAlreadyBlocked) {
                return next(appErr("You already blocked this user"))
            }
            //7. push userToBeBlocked to the userWhoblocked's blocked array
            userWhoBlocked.blocked.push(userToBeBlocked._id)
            //8. save
            await userWhoBlocked.save()
            res.json({
                status: 'Success',
                data: "You have successfully blocked this user"
            })
        }

    } catch (error) {
        next(appErr(error.message))
    }
}

// Unblock
const unblockUserCtrl = async (req, res, next) => {
    try {
        //1. Find the user to be unblocked
        const userToBeUnblocked = await User.findById(req.params.id)
        //2. find the user who is unblocking
        const userWhoUnblocked = await User.findById(req.userAuth)
        //3. check if userToBeUnblocked and userWhoblocked are found
        if (userToBeUnblocked && userWhoUnblocked) {
            //4. check if userToBeBlocked is already in the array's of userWhoUnblocked
            const isUserAlreadyBlocked = userWhoUnblocked.blocked.find(blocked =>
                blocked.toString() === userToBeUnblocked._id.toHexString()
            )
            if (!isUserAlreadyBlocked) {
                return next(appErr("You have not blocked this user"))
            }
            //5. Remove the userToBeUnblocked from the main user
            userWhoUnblocked.blocked = userWhoUnblocked.blocked.filter(
                blocked => blocked.toString() !== userToBeUnblocked._id.toString()
            )
            // save
            await userWhoUnblocked.save()
            res.json({
                status: 'Success',
                data: "You have successfully Unblocked this user"
            })
        }

    } catch (error) {
        next(appErr(error.message))
    }
}

// admin-block 
const adminblockUserCtrl = async (req, res, next) => {
    try {
        //1. find the user to be blocked
        const userToBeBlocked = await User.findById(req.params.id)
        //2. check if user found
        if (!userToBeBlocked) {
            return next(appErr("User not found"))
        }
        // change  the isBlocked to true
        userToBeBlocked.isBlocked = true
        //4. save
        await userToBeBlocked.save()
        res.json({
            status: 'Success',
            data: "You have successfully block this user"
        })
    } catch (error) {
        next(appErr(error.message))
    }
}

// admin-Unblock 
const adminUnblockUserCtrl = async (req, res, next) => {
    try {
        //1. find the user to be Unblocked
        const userToBeUnblocked = await User.findById(req.params.id)
        //2. check if user found
        if (!userToBeUnblocked) {
            return next(appErr("User not found"))
        }
        // change  the isBlocked to true
        userToBeUnblocked.isBlocked = false
        //4. save
        await userToBeUnblocked.save()
        res.json({
            status: 'Success',
            data: "You have successfully Unblock this user"
        })
    } catch (error) {
        next(appErr(error.message))
    }
}

// Delete Account
const userDeleteCtrl = async (req, res, next) => {

    try {
        //1. Find the user to be deleted
        const userTodelete = await User.findById(req.userAuth)
        //2. Find all post to be deleted
        await Post.deleteMany({ user: req.userAuth })
        //3. delete all comments of user
        await Comment.deleteMany({ user: req.userAuth })
        //4. delete all categor of user
        await Category.deleteMany({ user: req.userAuth })
        //5. delete user
        await userTodelete.delete()
        //send response
        res.json({
            status: 'Success',
            data: "You have successfully deleted your account"
        })
    } catch (error) {
        next(appErr(error.message))
    }
}

// Profile Update
const userUpdateCtrl = async (req, res, next) => {
    const { email, firstName, lastName } = req.body
    try {
        // check if email is not take
        if (email) {
            const emailTaken = await User.findOne({ email })
            if (emailTaken) {
                return next(appErr('Email is taken', 400))
            }
        }
        // update the user
        const user = await User.findByIdAndUpdate(req.userAuth, {
            lastName,
            firstName,
            email
        }, {        // configurations==> give updated value
            new: true,
            runValidators: true,
        })
        // send response
        res.json({
            status: 'Success',
            data: user
        })
    } catch (error) {
        next(appErr(error.message))
    }
}

// Updating password
const userUpdatePasswordCtrl = async (req, res, next) => {
    const { password } = req.body
    try {
        // check if user is updating the password
        if (password) {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)
            //update user
            const user = await User.findByIdAndUpdate(req.userAuth, {
                password: hashedPassword
            }, {
                new: true,
                runValidators: true
            })
            res.json({
                status: 'Success',
                data: 'Password has been change successfully',
            })
        }
        else {
            return next(appErr('Please provide password field'))
        }
    } catch (error) {
        next(appErr(error.message))
    }
}
// Profile Photo Upload
const profilePhotoUploadCtrl = async (req, res, next) => {
    // console.log(req.file)
    console.log(req.userAuth)
    try {
        //1. Find the user to be updated
        const userToUpdate = await User.findById(req.userAuth)
        //2. check if user is found

        if (!userToUpdate) {
            return next(appErr('User not found', 403))
        }

        //3. check if user is blocked
        if (userToUpdate.isBlocked) {
            return next(appErr('Action not allowed, your account is blocked', 403))
        }
        //4. check if a user is updating their photo
        if (req.file) {
            //5. update profile photo
            await User.findByIdAndUpdate(
                req.userAuth,
                {
                    $set: {
                        profilePhoto: req.file.path,
                    },
                },
                {
                    new: true,
                }
            )
            res.json({
                status: 'Success',
                data: "You have succesfully updated your profile photo"
            })
        }
    } catch (error) {
        next(appErr(error.message, 500))
    }
}

module.exports = {
    userRegisterCtrl,
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
    userUpdatePasswordCtrl

}