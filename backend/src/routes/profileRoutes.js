const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateJWT } = require('../middleware/auth');

router.use(authenticateJWT); // All profile routes require authentication

router.get('/', profileController.getProfile);
router.patch('/me', profileController.updateMe);
router.post('/info', profileController.upsertAttributeInfo);
router.post('/projects', profileController.addProject);
router.put('/projects/:id', profileController.updateProject);
router.delete('/projects/:id', profileController.deleteProject);

module.exports = router;
