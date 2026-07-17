const express = require('express');
const router = express.Router();
const attributeController = require('../controllers/attributeController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

router.get('/', attributeController.getAllAttributes);
router.post('/', authenticateJWT, authorizeRoles('RECRUITER', 'ADMIN'), attributeController.createAttribute);
router.put('/:id', authenticateJWT, authorizeRoles('RECRUITER', 'ADMIN'), attributeController.updateAttribute);
router.delete('/:id', authenticateJWT, authorizeRoles('RECRUITER', 'ADMIN'), attributeController.deleteAttribute);

module.exports = router;
