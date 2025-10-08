const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/jwtTokenCheck");
const groupCreated = require("../controllers/groupCreate")
const GetGroups = require("../controllers/groupGet")
const InviteMembers = require("../controllers/inviteMember")
const inviteAccept = require("../controllers/inviteAccept")
const ensureMember = require('../middlewares/ensureMember');
const ensureAdmin = require('../middlewares/ensureAdmin');
const groupPage = require('../controllers/groupPage');
const expenseSplit = require('../controllers/expenseSplit');
const getBalances = require('../controllers/balance')
const settleAmount = require('../controllers/settlement')

router.post('/group',authMiddleware,groupCreated);
router.get('/group',authMiddleware,GetGroups);
router.get('/group/:id',authMiddleware,ensureMember,groupPage)
router.post('/group/:id/invite',authMiddleware,ensureAdmin,InviteMembers)
router.post('/group/invite/accept/:id',inviteAccept)
router.post('/group/:id/expenses',authMiddleware,ensureMember,expenseSplit);
router.get('/group/:id/balances',authMiddleware,getBalances)
router.post('/group/:id/settle',authMiddleware,settleAmount)

module.exports = router;
