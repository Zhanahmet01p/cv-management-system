const express = require('express');
const router = express.Router();
const cvController = require('../controllers/cvController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

router.use(authenticateJWT);

router.post('/', cvController.createCV);
router.get('/:id', cvController.getCVData);
router.patch('/:id/publish', cvController.publishCV);

router.post('/:cvId/like', authorizeRoles('RECRUITER', 'ADMIN'), cvController.toggleLike);

module.exports = router;
