const express = require('express');
const contentController = require('../controllers/contentController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Teacher routes
router.post(
  '/upload',
  authenticate,
  requireRole('teacher'),
  uploadMiddleware,
  contentController.upload
);

router.get(
  '/my',
  authenticate,
  requireRole('teacher'),
  contentController.getMyContent
);

// Principal routes
router.get(
  '/all',
  authenticate,
  requireRole('principal'),
  contentController.getAllContent
);

router.get(
  '/pending',
  authenticate,
  requireRole('principal'),
  contentController.getPendingContent
);

router.post(
  '/:id/approve',
  authenticate,
  requireRole('principal'),
  contentController.approve
);

router.post(
  '/:id/reject',
  authenticate,
  requireRole('principal'),
  contentController.reject
);

module.exports = router;
