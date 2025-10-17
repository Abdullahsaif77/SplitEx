const express = require('express')
const { register , login} = require("../controllers/authController")
const authMiddleware = require("../middlewares/jwtTokenCheck")


const router = express.Router();

router.post('/register',register);
router.post('/login',login)
router.get('/profile',authMiddleware , (req,res)=>{
    res.json({ message: "Protected route", user: req.user });
})

module.exports = router;