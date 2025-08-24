const express = require("express");
const router = express.Router();

const AccountController = require("../controllers/AccountController");
const {
  refreshTokenChecker,
  accessTokenChecker,
} = require("../middlewares/token-middlewares");
const { requireRole } = require("../middlewares/role-checker");

router.post("/sign-up", AccountController.signUp);
router.post("/sign-in", AccountController.signIn);
router.get("/rftk", refreshTokenChecker, AccountController.getNewAccessToken);
router.get("/check", AccountController.checkValidEmail);
router.get("/check-session", AccountController.checkSession);

router.get(
  "/",
  accessTokenChecker,
  requireRole(1),
  AccountController.getAllAccounts,
);
// router.get("/", AccountController.getAllAccounts);
router.patch(
  "/:accountId/active",
  accessTokenChecker,
  requireRole(1),
  AccountController.updateAccountActiveStatus,
);

router.post(
  "/:accountId/set-password",
  accessTokenChecker,
  requireRole(1),
  AccountController.setAccountPassword,
);

module.exports = router;
