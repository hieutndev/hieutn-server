const express = require('express');
const router = express.Router();

const GameCardRoutes = require('./GameCardRoutes');
const ProjectRoutes = require('./ProjectRoutes');
const EducationRoutes = require('./EducationRoutes');
const CertificationRoutes = require('./CertificationRoutes');
const EmploymentRoutes = require('./EmploymentRoutes');
const AccountRoutes = require('./AccountRoutes');
const AppRoutes = require('./AppRoutes');
const S3Routes = require('./S3Routes');
const AnalyticsRoutes = require('./AnalyticsRoutes');
const SettingRoutes = require('./SettingRoutes');


router.use('/game-card', GameCardRoutes);
router.use('/football', GameCardRoutes);
router.use('/projects', ProjectRoutes);
router.use('/education', EducationRoutes);
router.use('/certification', CertificationRoutes);
router.use('/employment', EmploymentRoutes);
router.use('/accounts', AccountRoutes);
router.use('/apps', AppRoutes);
router.use('/s3', S3Routes);
router.use('/analytics', AnalyticsRoutes);
router.use('/settings', SettingRoutes);

module.exports = router;
