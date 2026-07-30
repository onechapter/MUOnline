const express = require('express');
const router = express.Router();
const characterController = require('../controllers/characterController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/classes', characterController.getClasses);
router.post('/', characterController.createClass);
router.get('/', characterController.listCharacters);
router.get('/:id', characterController.getCharacter);
router.delete('/:id', characterController.deleteCharacter);
router.patch('/:id/stats', characterController.updateStats);

module.exports = router;