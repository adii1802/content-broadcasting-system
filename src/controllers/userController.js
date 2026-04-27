const { success } = require('../utils/response');

exports.getProfile = (req, res) => {
  // Simple stub assuming authMiddleware sets req.user
  return success(res, req.user, 'Profile fetched successfully');
};
