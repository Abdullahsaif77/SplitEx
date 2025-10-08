const express = require('express')
const Router = express.Router()
const authMiddleware = require('../middlewares/jwtTokenCheck')
const getBalances = require('../controllers/getBalance')
const GetUserBalances = require('../controllers/getUserBalances')
const getUsers = require('../controllers/getUsers')
const getGroups = require('../controllers/getGroups')
const getExpense = require('../controllers/getExpenses')
const getSettlement = require('../controllers/getSettlements')


Router.get('/home',authMiddleware,getBalances)
Router.get('/balances',authMiddleware,GetUserBalances)
Router.get('/friends',getUsers)
Router.get('/groups',authMiddleware,getGroups)
Router.get('/Expenses',authMiddleware,getExpense)
Router.get('/settlements',authMiddleware,getSettlement)


module.exports = Router;