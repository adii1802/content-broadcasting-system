const { error } = require('../utils/response');

exports.requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return error(res, 'Access denied. Insufficient permissions.', 403);
    }
    next();
  };
};
