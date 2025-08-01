const express = require('express');
const router = express.Router();

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } })

const S3Controller = require('../controllers/S3Controller');
const { accessTokenChecker } = require("../middlewares/token-middlewares");
const { requireRole } = require("../middlewares/role-checker");

router.post('/', upload.single("image"), S3Controller.uploadImage);
router.get('/', S3Controller.getImageByKey);

module.exports = router;