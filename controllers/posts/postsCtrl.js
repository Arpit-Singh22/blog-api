const Post = require("../../model/Post/Post")
const User = require("../../model/User/User")
const appErr = require("../../utils/appErr")


// create Post
const postCreateCtrl = async (req, res) => {
    // console.log(req.file);
    const { title, description, category } = req.body
    try {
        //1. Find the user who is creating
        const author = await User.findById(req.userAuth)

        // check if the user is blocked
        if (author.isBlocked) {
            return next(appErr("Access denied, account blocked", 403))
        }

        //2. Create the post
        const postCreated = await Post.create({
            title,
            description,
            user: author._id,
            category,
            photo: req && req.file ? req.file.path : undefined,
        })
        //3. Associate user to a post - Push the post into user posts field
        author.posts.push(postCreated)
        // save
        await author.save()
        res.json({
            status: 'Success',
            data: postCreated
        })
    } catch (error) {
        next(appErr(error.message))
    }
}

//fetch post
const fetchPostCtrl = async (req, res, next) => {
    try {
        //Find all post
        const posts = await Post.find({})
            .populate('user')
            .populate('category', 'title')

        // check if the user is blocked by the post owner
        const filterdPosts = posts.filter(post => {
            // get all blocked users
            const blockedUsers = post.user.blocked
            const isBlocked = blockedUsers.includes(req.userAuth)

            return isBlocked ? null : post
        })

        res.json({
            status: 'Success',
            data: filterdPosts,
        })
    } catch (error) {
        next(appErr(error.message))
    }
}

// toggle likes
const toggleLikesPostCtrl = async (req, res, next) => {
    try {
        //1. Get the post
        const post = await Post.findById(req.params.id)
        // check if the user has already liked the post
        const isLiked = post.likes.includes(req.userAuth)
        //3. if the user has already liked the post, unlike the post
        if (isLiked) {
            post.likes = post.likes.filter(like => like.toString() !== req.userAuth.toString())
            await post.save()
        }
        else {
            //4. if the user has not liked the post, like the post
            post.likes.push(req.userAuth)
            await post.save()
        }
        res.json({
            status: 'Success',
            data: post,
        })
    } catch (error) {
        next(appErr(error.message))
    }
}

// toggle dislikes
const toggleDislikesPostCtrl = async (req, res, next) => {
    try {
        //1. Get the post
        const post = await Post.findById(req.params.id)
        // check if the user has already unliked the post
        const isUnliked = post.disLikes.includes(req.userAuth)
        //3. if the user has already liked the post, unlike the post
        if (isUnliked) {
            post.disLikes = post.disLikes.filter(like => like.toString() !== req.userAuth.toString())
            await post.save()
        }
        else {
            //4. if the user has not liked the post, like the post
            post.disLikes.push(req.userAuth)
            await post.save()
        }
        res.json({
            status: 'Success',
            data: post,
        })
    } catch (error) {
        next(appErr(error.message))
    }
}

// single post
const postDetailCtrl = async (req, res, next) => {
    try {
        // find the post
        const post = await Post.findById(req.params.id)
        // number of view
        // check if user has viewed
        const isViewed = post.numViews.includes(req.userAuth)
        if (isViewed) {
            res.json({
                status: 'Success',
                data: post
            })
        }
        // push the user into numViews
        else {
            post.numViews.push(req.userAuth)
            await post.save()
            res.json({
                status: 'Success',
                data: post
            })
        }
    } catch (error) {
        next(appErr(error.message))
    }
}


// delete post
const postDeleteCtrl = async (req, res, next) => {
    try {
        //check if the post belongs to the user
        // find the post
        const post = await Post.findById(req.params.id)
        if (post.user.toString() !== req.userAuth.toString()) {   // post to delete request by user is equal to req.userAuth or not
            return next(appErr('You are not allowed to delete this post', 403))
        }
        await Post.findByIdAndDelete(req.params.id)
        res.json({
            status: 'Success',
            data: "Post deleted successfully"
        })
    } catch (error) {
        next(appErr(error.message))
    }
}

// update post
const postUpdateCtrl = async (req, res, next) => {
    const { title, description, category } = req.body
    try {

        // find the post
        const post = await Post.findById(req.params.id)
        //check if the post belongs to the user
        if (post.user.toString() !== req.userAuth.toString()) {   // post to delete request by user is equal to req.userAuth or not
            return next(appErr('You are not allowed to delete this post', 403))
        }
        await Post.findByIdAndUpdate(req.params.id, {
            title,
            description,
            category,
            photo: req && req.file ? req.file.path : undefined,
        }, {
            new: true
        })
        res.json({
            status: 'Success',
            data: post
        })
    } catch (error) {
        next(appErr(error.message))
    }
}

module.exports = {
    postCreateCtrl,
    postDetailCtrl,
    postDeleteCtrl,
    postUpdateCtrl,
    fetchPostCtrl,
    toggleLikesPostCtrl,
    toggleDislikesPostCtrl,
}