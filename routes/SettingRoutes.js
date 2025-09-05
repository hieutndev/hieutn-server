const express = require('express');
const router = express.Router();

const SettingController = require('../controllers/SettingController');

router.get('/', SettingController.getSettings);
router.post('/', SettingController.updateAllSetting);
router.put('/', SettingController.updateSetting);

module.exports = router;
