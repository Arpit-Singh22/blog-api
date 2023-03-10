const getTokenFromHeader = req => {
    // get token from header
    const headerObj = req.headers

    const token = headerObj['authorization'].split(" ")[1]
    // console.log(token)
    if (token !== undefined) {
        return token
    }
    else {
        return false;
    }
}

module.exports = getTokenFromHeader