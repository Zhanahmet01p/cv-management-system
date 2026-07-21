const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

router.get('/', positionController.getAllPositions);
router.get('/:id', positionController.getPositionById);

router.post('/', authenticateJWT, authorizeRoles('RECRUITER', 'ADMIN'), positionController.createPosition);
router.put('/:id', authenticateJWT, authorizeRoles('RECRUITER', 'ADMIN'), positionController.updatePosition);
router.post('/:id/duplicate', authenticateJWT, authorizeRoles('RECRUITER', 'ADMIN'), positionController.duplicatePosition);
router.delete('/:id', authenticateJWT, authorizeRoles('RECRUITER', 'ADMIN'), positionController.deletePosition);

router.post('/:id/comments', authenticateJWT, positionController.createComment);

module.exports = router;
