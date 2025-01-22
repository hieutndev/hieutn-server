const express = require('express');
const router = express.Router();

const EmploymentController = require('../controllers/EmploymentController');


router.get('/', EmploymentController.getListEmployment);
router.post("/", EmploymentController.addNewEmployment);
router.get("/:employmentId", EmploymentController.getEmploymentDetails);
router.patch("/:employmentId", EmploymentController.updateEmploymentDetails);
router.delete("/:employmentId", EmploymentController.permanentDeleteEmployment);
router.patch("/:employmentId/delete", EmploymentController.softDeleteEmployment);
router.patch("/:employmentId/recover", EmploymentController.recoverEmployment);

module.exports = router;