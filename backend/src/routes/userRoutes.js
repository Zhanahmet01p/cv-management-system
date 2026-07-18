const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

router.use(authenticateJWT);
router.use(authorizeRoles('ADMIN')); // All user management routes require ADMIN role

router.get('/', userController.getAllUsers);
router.patch('/:id/role', userController.updateUserRole);
router.post('/:id/toggle-block', userController.toggleBlockUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
