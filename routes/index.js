const express = require('express');
const router = express.Router();

const GameCardRoutes = require('./GameCardRoutes');


router.use('/game-card', GameCardRoutes);
router.use('/badminton', GameCardRoutes);
router.use('/football', GameCardRoutes);
router.use('/users', GameCardRoutes);

module.exports = router;
