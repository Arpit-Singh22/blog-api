const express = require('express')
const globalErrHandler = require('./middleware/globalErrHandler')
const categoryRouter = require('./routes/categories/categoryRouter')
const commentRouter = require('./routes/comments/commentRouter')
const postRouter = require('./routes/posts/postRouter')
const userRouter = require('./routes/users/userRoutes')
require('dotenv').config() // imporitng and then calling


require('./config/dbConnect')
const app = express()


// middlewares
// always write middleware logic before route
app.use(express.json())     // pass incoming payload

//---------
//routes
//-------
// middleware in pipeline
//users route
app.use("/api/v1/users/", userRouter)
// posts route
app.use("/api/v1/posts/", postRouter)
// comments route
app.use("/api/v1/comments/", commentRouter)
// categories route
app.use("/api/v1/categories", categoryRouter)

//Error handlers middleware
// implemented below routes
// this type of expression express will automatically treat it as error handler
app.use(globalErrHandler)

// 404 error
// * ->universal accept all / any route
app.use('*', (req, res) => {
    res.status(404).json({
        message: `${req.originalUrl} - Route Not Found`     // originalUrl ->> method of req
    })
})

// listen to server
const PORT = process.env.PORT || 9000

app.listen(PORT, console.log(`Server is up and running on PORT ${PORT}`))
