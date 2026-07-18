const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Public route as per requirements: "Non-authenticated users may view public statistics"
router.get('/', statsController.getStats);

module.exports = router;
