const appErr = require("../utils/appErr")
const getTokenFromHeader = require("../utils/getTokenFromHeader")
const verifyToken = require("../utils/verifyToken")


const isLogin = (req, res, next) => {
    // get token from header
    const token = getTokenFromHeader(req)

    // verify the token
    const decodedUser = verifyToken(token)

    // save the user into req object
    req.userAuth = decodedUser.id

    if (!decodedUser) {
        return next(appErr('Invalid/Expired token, please Login again'))
    }
    else {
        next()
    }
}

module.exports = isLogin