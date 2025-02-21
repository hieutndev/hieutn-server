const express = require('express');
const router = express.Router();

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

const CertificationController = require('../controllers/CertificationController');
const { accessTokenChecker } = require("../middlewares/token-middlewares");
const { requireRole } = require("../middlewares/role-checker");

router.get("/", CertificationController.getAllCerts);
router.post("/", accessTokenChecker, requireRole(1), upload.single("cert_image"), CertificationController.addNewCert);
router.get("/:certId", CertificationController.getCertInfo);
router.patch("/:certId", accessTokenChecker, requireRole(1), upload.single("cert_image"), CertificationController.updateCertInfo);
router.patch("/:certId/delete", accessTokenChecker, requireRole(1), CertificationController.softDeleteCert);
router.patch("/:certId/recover", accessTokenChecker, requireRole(1), CertificationController.recoverCert);
router.delete("/:certId", accessTokenChecker, requireRole(1), CertificationController.permanentDeleteCert);


module.exports = router;
