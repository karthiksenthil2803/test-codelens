const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

class UserService {
  constructor() {
    this.users = new Map();
  }

  createUser(userData) {
    const user = new User(uuidv4(), userData.name, userData.email, userData.status);
    user.validate();
    
    if (this.findByEmail(userData.email)) {
      throw new Error('User with this email already exists');
    }
    
    this.users.set(user.id, user);
    return user;
  }

  getUserById(id) {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }

  updateUser(id, updates) {
    const user = this.getUserById(id);
    
    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;
    if (updates.status) user.status = updates.status;
    
    user.validate();
    
    if (updates.email && updates.email !== user.email) {
      const existingUser = this.findByEmail(updates.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email already in use');
      }
    }
    
    return user;
  }

  deleteUser(id) {
    const user = this.getUserById(id);
    this.users.delete(id);
    return user;
  }

  findByEmail(email) {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  getActiveUsers() {
    return Array.from(this.users.values()).filter(user => user.isActive());
  }
}

module.exports = UserService;
