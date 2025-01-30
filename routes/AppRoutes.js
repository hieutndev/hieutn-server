const express = require('express');
const router = express.Router();

const AppController = require('../controllers/AppController');
const { refreshTokenChecker, accessTokenChecker } = require("../middlewares/token-middlewares");
const { requireRole } = require("../middlewares/role-checker");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

router.get("/", AppController.getAllApps);
router.post("/", accessTokenChecker, requireRole(1), upload.single("app_icon"), AppController.addNewApp);
router.get("/:appId", AppController.getAppDetails);
router.patch("/:appId", accessTokenChecker, requireRole(1), upload.single("app_icon"), AppController.updateAppInformation);
router.patch("/:appId/display-status", accessTokenChecker, requireRole(1), AppController.updateAppDisplayStatus);
router.delete("/:appId", accessTokenChecker, requireRole(1), AppController.deleteApp);


module.exports = router;