const express = require('express');
const router = express.Router();

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

const ProjectController = require('../controllers/ProjectController');
const { accessTokenChecker } = require("../middlewares/token-middlewares");
const { requireRole } = require("../middlewares/role-checker");


router.get('/', ProjectController.getAllProjects);
router.post('/', accessTokenChecker, requireRole(1), upload.single("project_thumbnail"), ProjectController.createNewProject);

router.get("/:projectId", ProjectController.getProjectDetails)
router.patch("/:projectId", accessTokenChecker, requireRole(1), upload.single("project_thumbnail"), ProjectController.updateProjectDetails);
router.delete("/:projectId", accessTokenChecker, requireRole(1), ProjectController.deleteProject);

module.exports = router;
