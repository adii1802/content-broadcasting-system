const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const { success, error } = require('../utils/response');

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const { name, email, password, role } = req.body;
    
    const { user, token } = await authService.registerUser(name, email, password, role);
    
    return success(res, { user, token }, 'User registered successfully', 201);
  } catch (err) {
    const statusCode = err.message === 'Email is already registered' ? 409 : 500;
    return error(res, err.message, statusCode);
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const { email, password } = req.body;
    
    const { user, token } = await authService.loginUser(email, password);
    
    return success(res, { user, token }, 'Login successful', 200);
  } catch (err) {
    const statusCode = err.message === 'Invalid email or password' ? 401 : 500;
    return error(res, err.message, statusCode);
  }
};
