const crypto = require('crypto');

const inviteTokenGenarate = (hours)=>{
    const token = crypto.randomBytes(20).toString('hex')
    const expiresAt = new Date(Date.now()+hours*60*60*100)
    return {token , expiresAt};
}

module.exports = inviteTokenGenarate;