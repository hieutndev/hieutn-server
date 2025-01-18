const express = require('express');
const router = express.Router();

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

const ProjectController = require('../controllers/ProjectController');


router.get('/', ProjectController.getAllProjects);
router.post('/', upload.single("project_thumbnail"), ProjectController.createNewProject);
router.get("/:projectId", ProjectController.getProjectDetails)
router.patch("/:projectId", upload.single("project_thumbnail"), ProjectController.updateProjectDetails);
router.delete("/:projectId", ProjectController.deleteProject);
// router.post("/:roomId/match-results", ProjectController.insertNewResults)
// router.get("/:roomId/results", ProjectController.getRoomResults)
// router.get("/:roomId", ProjectController.getRoomDetails)
// router.patch("/:roomId", ProjectController.updateRoomConfig)
// router.patch("/:roomId/close-room", ProjectController.closeRoom)

module.exports = router;
