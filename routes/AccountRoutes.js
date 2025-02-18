const express = require('express');
const router = express.Router();

const AccountController = require('../controllers/AccountController');
const { refreshTokenChecker, accessTokenChecker } = require("../middlewares/token-middlewares");
const { requireRole } = require("../middlewares/role-checker");

router.post("/sign-up", AccountController.signUp);
router.post("/sign-in", AccountController.signIn);
router.get("/rftk", refreshTokenChecker, AccountController.getNewAccessToken);
router.get("/check", AccountController.checkValidEmail)

router.get("/", accessTokenChecker, requireRole(1), AccountController.getAllUsers);
router.patch("/:accountId/active", accessTokenChecker, requireRole(1), AccountController.updateAccountActiveStatus);


module.exports = router;