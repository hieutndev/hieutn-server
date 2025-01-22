const express = require('express');
const router = express.Router();

const EducationController = require('../controllers/EducationController');

router.get('/', EducationController.getListEducation);
router.post("/", EducationController.addNewEducation);
router.get("/:educationId", EducationController.getEducationDetails);
router.patch("/:educationId", EducationController.updateEducationDetails);
router.delete("/:educationId", EducationController.permanentDeleteEducation);
router.patch("/:educationId/delete", EducationController.softDeleteEducation);
router.patch("/:educationId/recover", EducationController.recoverEducation);

module.exports = router;