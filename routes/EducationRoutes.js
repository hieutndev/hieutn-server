const express = require('express');
const router = express.Router();

const EducationController = require('../controllers/EducationController');
const { accessTokenChecker } = require("../middlewares/token-middlewares");
const { requireRole } = require("../middlewares/role-checker");

router.get('/', EducationController.getListEducation);
router.post("/", accessTokenChecker, requireRole(1), EducationController.addNewEducation);
router.get("/:educationId", EducationController.getEducationDetails);
router.patch("/:educationId", accessTokenChecker, requireRole(1), EducationController.updateEducationDetails);
router.delete("/:educationId", accessTokenChecker, requireRole(1), EducationController.permanentDeleteEducation);
router.patch("/:educationId/delete", accessTokenChecker, requireRole(1), EducationController.softDeleteEducation);
router.patch("/:educationId/recover", accessTokenChecker, requireRole(1), EducationController.recoverEducation);

module.exports = router;