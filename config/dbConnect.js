const mongoose = require('mongoose')


// function to connect

const dbConnect = async () => {
    mongoose.set('strictQuery', true)
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('DB has connected successfully');
    }
    catch (error) {
        console.log(error.message);
        process.exit(1)
    }
}

dbConnect()