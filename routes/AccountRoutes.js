const express = require('express');
const router = express.Router();

const AccountController = require('../controllers/AccountController');
const { refreshTokenChecker } = require("../middlewares/token-middlewares");

router.post("/sign-up", AccountController.signUp);
router.post("/sign-in", AccountController.signIn);
router.get("/rftk", refreshTokenChecker, AccountController.getNewAccessToken);


module.exports = router;