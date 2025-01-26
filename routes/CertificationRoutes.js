const express = require('express');
const router = express.Router();

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

const CertificationController = require('../controllers/CertificationController');
const { accessTokenChecker } = require("../middlewares/token-middlewares");
const { requireRole } = require("../middlewares/role-checker");

router.get("/", CertificationController.getAll);
router.post("/", accessTokenChecker, requireRole(1), upload.single("cert_image"), CertificationController.addNewCertification);
router.get("/:certId", CertificationController.getCertificationDetails);
router.patch("/:certId", accessTokenChecker, requireRole(1), upload.single("cert_image"), CertificationController.updateCertification);
router.patch("/:certId/delete", accessTokenChecker, requireRole(1), CertificationController.softDeleteCertification);
router.patch("/:certId/recover", accessTokenChecker, requireRole(1), CertificationController.recoverCertification);
router.delete("/:certId", accessTokenChecker, requireRole(1), CertificationController.permanentDeleteCertification);


module.exports = router;
