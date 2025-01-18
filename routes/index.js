const express = require('express');
const router = express.Router();

const GameCardRoutes = require('./GameCardRoutes');
const ProjectRoutes = require('./ProjectRoutes');


router.use('/game-card', GameCardRoutes);
router.use('/badminton', GameCardRoutes);
router.use('/football', GameCardRoutes);
router.use('/users', GameCardRoutes);
router.use('/projects', ProjectRoutes);

module.exports = router;
