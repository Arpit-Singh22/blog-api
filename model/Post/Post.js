const mongoose = require('mongoose')

// create schema

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Post Title is required']
    },
    description: {
        type: String,
        required: [true, 'Post description is required']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Post category is required']
    },
    numViews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    disLikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'Author is required']
    },
    photo: {
        type: String,
        required: [true, 'Post image is required']
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        }
    ]
},
    {
        timestamps: true,
        toJSON: { virtuals: true }
    }
)

//Hook
postSchema.pre(/^find/, function (next) {
    //add views count as virtual field
    postSchema.virtual('viewsCount').get(function () {
        return this.numViews.length
    })

    // add likes count as virtual property
    postSchema.virtual('likesCount').get(function () {
        return this.likes.length
    })

    // add dislikes count
    postSchema.virtual('dislikesCount').get(function () {
        return this.disLikes.length
    })
    // check the most like post in percentage
    postSchema.virtual('LikesPercentage').get(function () {
        const post = this
        const total = +post.likes.length + +post.disLikes.length
        const percentage = (post.likes.length / total) * 100
        return `${percentage}%`
    })

    // check the most dislike post in percentage
    postSchema.virtual('dislikesPercentage').get(function () {
        const post = this
        const total = +post.disLikes.length + +post.disLikes.length
        const percentage = (post.disLikes.length / total) * 100
        return `${percentage}%`
    })

    // if days is less than 0 return today if days is 1 yesterday
    // else return days ago
    postSchema.virtual('daysAgo').get(function () {
        const post = this
        const date = new Date(post.createdAt)
        const daysAgo = Math.floor((Date.now() - date) / 86400000)

        return daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`
    })
    next()
})


// compile the user model
const Post = mongoose.model('Post', postSchema)     //('Post') respresent collection inside db after compile convert to lowercase

module.exports = Post
