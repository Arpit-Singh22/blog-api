const mongoose = require('mongoose')
const Post = require('../Post/Post')

// create schema --> blueprinte where we can create instances of users
// have some validation

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First Name is required"]
    },
    lastName: {
        type: String,
        required: [true, "Last Name is required"]
    },
    profilePhoto: {
        type: String,
    },
    email: {
        type: String,
        required: [true, "Email is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['Admin', "Guest", 'Editor']
    },
    viewers: [
        {
            type: mongoose.Schema.Types.ObjectId,        // to save id's of user
            ref: "User"
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,        // to save id's of user
            ref: "User"         // to model
        }
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"             // to model
        }
    ],
    blocked: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"             // to model
        }
    ],
    plan: [
        {
            type: String,
            enum: ['Free', 'Premium', 'Pro'],
            default: 'Free'
        }
    ],
    userAward: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold'],
        default: 'Bronze'
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        }
    ],
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
)

// Hooks
// Pre - before record is being saved => find/findOne(other query methods)
// only argument this callback funtion take is next

userSchema.pre("findOne", async function (next) {
    //populate the posts
    this.populate({
        path: "posts",
    })
    //1. get user id
    const userId = this._conditions._id
    // find the post created by the user
    const posts = await Post.find({ user: userId })
    const lastPost = posts[posts.length - 1]

    // get the last post date
    const lastPostDate = new Date(lastPost?.createdAt)

    // get the last post date string format
    const lastPostDateStr = lastPostDate.toDateString()
    //add virtuals to the schema
    userSchema.virtual('lastPostDate').get(function () {
        return lastPostDateStr
    })

    // -----------check if user is inactive for 30 days----------
    // get current date
    const currentDate = new Date()
    // get the difference between the last post date and the current date
    const diff = currentDate - lastPostDate
    // get the difference in days and return less than in days
    const diffIndays = diff / (1000 * 360 * 24)
    if (diffIndays > 30) {
        // Add virtuals isInactive to the schema to checkif a user is inactive for 30 days
        userSchema.virtual("isInactive").get(function () {
            return true
        })
        // find the user by ID and update
        await User.findByIdAndUpdate(userId, {
            isBlocked: true
        }, {
            new: true,
        })
    }
    else {
        userSchema.virtual("isInactive").get(function () {
            return false
        })
        // find the user by ID and update
        await User.findByIdAndUpdate(userId, {
            isBlocked: false
        }, {
            new: true,
        })
    }
    // ------Last Active Date ------
    const daysAgo = Math.floor(diffIndays)
    // Add virtuals lastActive in days to the schema

    userSchema.virtual("lastActive").get(function () {
        // check if daysAgo is less than 0
        if (daysAgo <= 0) {
            return 'Today'
        }
        // check if daysAgo is equal to 1
        if (daysAgo === 1) {
            return 'Yesterday'
        }
        // check if daysAgo is greater 1
        if (daysAgo > 1) {
            return `${daysAgo} days ago`
        }
    })
    // ----Update userAward based on the number of posts ----
    // get the number of posts
    const numberOfPosts = posts.length
    // check if the number of posts is less than 10
    if (numberOfPosts < 10) {
        await User.findByIdAndUpdate(userId, {
            userAward: "Bronze",
        }, {
            new: true,
        })
    }
    // check if the number of posts is more than 10
    if (numberOfPosts > 10) {
        await User.findByIdAndUpdate(userId, {
            userAward: "Silver",
        }, {
            new: true,
        })
    }
    // check if the number of posts is more than 20
    if (numberOfPosts > 20) {
        await User.findByIdAndUpdate(userId, {
            userAward: "Gold",
        }, {
            new: true,
        })
    }
    next()
})

// Post - after saving => saving/create
userSchema.post('save', function (next) {
    // console.log('post hook');
})

// Get fullname
userSchema.virtual("fullname").get(function () {
    return `${this.firstName} ${this.lastName}`
})

// get user initials
userSchema.virtual('intials').get(function () {
    return `${this.firstName[0]}${this.lastName[0]}`
})

// get user post count
userSchema.virtual('postCount').get(function () {
    return `${this.posts.length}`
})

// get user followers count
userSchema.virtual('followersCount').get(function () {
    return `${this.followers.length}`
})

// get user following count
userSchema.virtual('followingCount').get(function () {
    return `${this.following.length}`
})

// get user viewers count
userSchema.virtual('viewersCount').get(function () {
    return `${this.viewers.length}`
})

// get user blocked count
userSchema.virtual('blockedCount').get(function () {
    return `${this.blocked.length}`
})


const User = mongoose.model('User', userSchema)     //('User') respresent collection inside db after compile convert to lowercase

module.exports = User
