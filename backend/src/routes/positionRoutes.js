const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// Public/Candidate can view
router.get('/', positionController.getAllPositions);
router.get('/:id', positionController.getPositionById);

// Recruiter/Admin only
router.post('/', authenticateJWT, authorizeRoles('RECRUITER', 'ADMIN'), positionController.createPosition);
router.put('/:id', authenticateJWT, authorizeRoles('RECRUITER', 'ADMIN'), positionController.updatePosition);
router.post('/:id/duplicate', authenticateJWT, authorizeRoles('RECRUITER', 'ADMIN'), positionController.duplicatePosition);
router.delete('/:id', authenticateJWT, authorizeRoles('RECRUITER', 'ADMIN'), positionController.deletePosition);

// Discussions - any authenticated user can comment on a position
router.post('/:id/comments', authenticateJWT, positionController.createComment);

module.exports = router;
