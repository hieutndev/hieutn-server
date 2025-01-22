const express = require('express');
const router = express.Router();

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

const CertificationController = require('../controllers/CertificationController');

router.get("/", CertificationController.getAll);
router.post("/", upload.single("cert_image"), CertificationController.addNewCertification);
router.get("/:certId", CertificationController.getCertificationDetails);
router.patch("/:certId", upload.single("cert_image"), CertificationController.updateCertification);
router.patch("/:certId/delete", CertificationController.softDeleteCertification);
router.patch("/:certId/recover", CertificationController.recoverCertification);
router.delete("/:certId", CertificationController.permanentDeleteCertification);


module.exports = router;
