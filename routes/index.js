const express = require('express');
const router = express.Router();

const GameCardRoutes = require('./GameCardRoutes');
const BadmintonRoutes = require('./BadmintonRoutes');
const ProjectRoutes = require('./ProjectRoutes');
const EducationRoutes = require('./EducationRoutes');
const CertificationRoutes = require('./CertificationRoutes');
const EmploymentRoutes = require('./EmploymentRoutes');
const AccountRoutes = require('./AccountRoutes');
const AppRoutes = require('./AppRoutes');


router.use('/game-card', GameCardRoutes);
router.use('/badminton', BadmintonRoutes);
router.use('/football', GameCardRoutes);
router.use('/users', GameCardRoutes);
                                                                                                                                                                                                              
router.use('/projects', ProjectRoutes);
router.use('/education', EducationRoutes);
router.use('/certification', CertificationRoutes);
router.use('/employment', EmploymentRoutes);
router.use('/accounts', AccountRoutes);
router.use('/apps', AppRoutes);

module.exports = router;
