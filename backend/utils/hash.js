const bcrypt = require('bcryptjs');

const hashpassword = async(password)=>{
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password,salt);
}

const comparePassword = async(enterdPassword,hashpassword)=>{
    return bcrypt.compare(enterdPassword , hashpassword)
}

module.exports = {hashpassword,comparePassword}