const express = require('express');
const router = express.Router();
const attributeController = require('../controllers/attributeController');

// TODO: Add auth middleware for Recruiters/Admins only
router.get('/', attributeController.getAllAttributes);
router.post('/', attributeController.createAttribute);
router.put('/:id', attributeController.updateAttribute);
router.delete('/:id', attributeController.deleteAttribute);

module.exports = router;
