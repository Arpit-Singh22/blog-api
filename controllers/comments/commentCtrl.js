const Comment = require("../../model/Comment/Comment")
const Post = require("../../model/Post/Post")
const User = require("../../model/User/User")
const appErr = require("../../utils/appErr")

// Create comment
const commentCreateCtrl = async (req, res, next) => {
    const { description } = req.body
    try {
        // find the post
        const post = await Post.findById(req.params.id)
        // find the user
        const user = await User.findById(req.userAuth)
        // create the comment
        const comment = await Comment.create({
            post: post._id,
            description,
            user: req.userAuth
        })
        // push the comment to post
        post.comments.push(comment._id)
        // push to the user
        user.comments.push(comment._id)
        // save
        // Disabled validation
        await post.save({ validateBeforeSave: false })
        await user.save({ validateBeforeSave: false })

        res.json({
            status: 'Success',
            data: comment,
        })
    } catch (error) {
        next(appErr(error.message))
    }
}

// comment update
const commentUpdateCtrl = async (req, res, next) => {
    const { description } = req.body
    try {
        // find the comment
        const comment = await Comment.findById(req.params.id)
        //check if the comment belongs to the user
        if (comment.user.toString() !== req.userAuth.toString()) {   // post to delete request by user is equal to req.userAuth or not
            return next(appErr('You are not allowed to update this comment', 403))
        }
        const category = await Comment.findByIdAndUpdate(req.params.id,
            { description }, { new: true })
        res.json({
            status: 'Success',
            data: category
        })
    } catch (error) {
        return next(appErr(error.message))
    }
}

// delete comment
const commentDeleteCtrl = async (req, res, next) => {
    try {
        // find the comment
        const comment = await Comment.findById(req.params.id)
        //check if the comment belongs to the user
        if (comment.user.toString() !== req.userAuth.toString()) {   // post to delete request by user is equal to req.userAuth or not
            return next(appErr('You are not allowed to delete this comment', 403))
        }
        await Comment.findByIdAndDelete(req.params.id)
        res.json({
            status: 'Success',
            data: "Comment has been deleted successfully"
        })
    } catch (error) {
        return next(appErr(error.message))
    }
}




module.exports = {
    commentCreateCtrl,
    commentDeleteCtrl,
    commentUpdateCtrl
}