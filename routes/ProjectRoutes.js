const express = require('express');
const router = express.Router();

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } })

const ProjectController = require('../controllers/ProjectController');
const { accessTokenChecker } = require("../middlewares/token-middlewares");
const { requireRole } = require("../middlewares/role-checker");


router.get('/', ProjectController.getAllProjects);
router.get('/top-viewed', ProjectController.getTopViewedArticles);
router.post('/', accessTokenChecker, requireRole(1), upload.fields([
	{
		name: "project_thumbnail",
		maxCount: 1,
	},
	{
		name: "project_images",
		maxCount: 20,
	}
]), ProjectController.createNewProject);

// router.post('/', upload.fields([
// 	{
// 		name: "project_thumbnail",
// 		maxCount: 1,
// 	},
// 	{
// 		name: "project_images",
// 		maxCount: 20,
// 	}
// ]), ProjectController.createNewProject);
router.get("/groups", ProjectController.getListProjectGroups);
router.post("/groups", ProjectController.createNewProjectGroups);
router.patch("/groups/:groupId", ProjectController.updateProjectGroups)
router.patch("/groups/:groupId/delete", ProjectController.softDeleteProjectGroup);
router.patch("/groups/:groupId/recover", ProjectController.recoverProjectGroup);
router.delete("/groups/:groupId", ProjectController.permanentDeleteProjectGroup);

router.get("/:projectId", ProjectController.getProjectDetails)
router.patch("/:projectId", accessTokenChecker, requireRole(1), upload.fields([
	{
		name: "project_thumbnail",
		maxCount: 1,
	},
	{
		name: "project_images",
		maxCount: 20,
	}
]), ProjectController.updateProjectDetails);

router.delete("/:projectId", accessTokenChecker, requireRole(1), ProjectController.deleteProject);

module.exports = router;
