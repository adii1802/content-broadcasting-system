const express = require('express');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const contentController = require('../controllers/contentController');

const router = express.Router();

const cache = new NodeCache({ stdTTL: 30 });

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});

const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl || req.url;
  const cachedResponse = cache.get(key);
  if (cachedResponse) {
    return res.status(200).json(cachedResponse);
  }
  
  // Override res.json to cache response
  const originalJson = res.json;
  res.json = function(body) {
    cache.set(key, body);
    return originalJson.call(this, body);
  };
  next();
};

router.get('/content/live/:teacherId', apiLimiter, cacheMiddleware, contentController.getLiveContent);

module.exports = router;
