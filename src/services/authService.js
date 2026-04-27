const bcrypt = require('bcrypt');
const User = require('../models/user');
const { generateToken } = require('../utils/jwt');

exports.registerUser = async (name, email, password, role) => {
  const existingUser = await User.getUserByEmail(email);
  if (existingUser) {
    throw new Error('Email is already registered');
  }

  const password_hash = await bcrypt.hash(password, 10);
  const newUser = await User.createUser({ name, email, password_hash, role });

  const token = generateToken({ id: newUser.id, role: newUser.role });

  return { user: newUser, token };
};

exports.loginUser = async (email, password) => {
  const user = await User.getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken({ id: user.id, role: user.role });
  
  const { password_hash, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};
