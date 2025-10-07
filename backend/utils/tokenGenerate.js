const jwt = require("jsonwebtoken")
require("dotenv").config()
const secret_key = process.env.JWT_SECRET_PASS

const generateToken = (user)=>{
    return jwt.sign(
        {
            id: user._id,
            name: user.name,
            email: user.email,
        },
        secret_key,
        {expiresIn:'24h'}

    )
}

module.exports = generateToken;