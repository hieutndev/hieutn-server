const express = require('express');
const router = express.Router();

const EmploymentController = require('../controllers/EmploymentController');
const { accessTokenChecker } = require("../middlewares/token-middlewares");
const { requireRole } = require("../middlewares/role-checker");


router.get('/', EmploymentController.getListEmployment);
router.post("/", accessTokenChecker, requireRole(1), EmploymentController.addNewEmployment);
router.get("/:employmentId", EmploymentController.getEmploymentDetails);
router.patch("/:employmentId", accessTokenChecker, requireRole(1), EmploymentController.updateEmploymentDetails);
router.delete("/:employmentId", accessTokenChecker, requireRole(1), EmploymentController.permanentDeleteEmployment);
router.patch("/:employmentId/delete", accessTokenChecker, requireRole(1), EmploymentController.softDeleteEmployment);
router.patch("/:employmentId/recover", accessTokenChecker, requireRole(1), EmploymentController.recoverEmployment);

module.exports = router;