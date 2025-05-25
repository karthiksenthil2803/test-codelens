const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

class UserService {
  constructor() {
    this.users = new Map();
    this.userMetrics = new Map(); // NEW: Track user activity metrics
  }

  // MODIFIED: Enhanced user creation with role and subscription
  createUser(userData) {
    const user = new User(
      uuidv4(), 
      userData.name, 
      userData.email, 
      userData.status || 'pending_verification', // CHANGED: Default to pending
      userData.role || 'customer'
    );
    
    if (userData.subscriptionTier) {
      user.subscriptionTier = userData.subscriptionTier;
      user.orderLimit = user.calculateOrderLimit();
    }
    
    user.validate();
    
    if (this.findByEmail(userData.email)) {
      throw new Error('User with this email already exists');
    }
    
    this.users.set(user.id, user);
    this.initializeUserMetrics(user.id); // NEW: Initialize metrics
    return user;
  }

  getUserById(id) {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.updateLastActive(); // NEW: Update activity on access
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
    if (updates.role) user.role = updates.role; // NEW: Role updates
    if (updates.subscriptionTier) { // NEW: Subscription updates
      user.upgradeSubscription(updates.subscriptionTier);
    }
    
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
    this.userMetrics.delete(id); // NEW: Clean up metrics
    return user;
  }

  findByEmail(email) {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  // MODIFIED: Enhanced active users check
  getActiveUsers() {
    return Array.from(this.users.values()).filter(user => user.isActive());
  }

  // NEW: Get users who can place orders (critical for order-service)
  getUsersEligibleForOrders() {
    return Array.from(this.users.values()).filter(user => user.canPlaceOrders());
  }

  // NEW: Get user order capacity (affects order-service limits)
  getUserOrderCapacity(userId) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const metrics = this.userMetrics.get(userId) || { ordersThisMonth: 0 };
    const remainingCapacity = user.orderLimit - metrics.ordersThisMonth;
    
    return {
      userId: user.id,
      orderLimit: user.orderLimit,
      ordersThisMonth: metrics.ordersThisMonth,
      remainingCapacity: Math.max(0, remainingCapacity),
      canPlaceOrder: remainingCapacity > 0 && user.canPlaceOrders(),
      subscriptionTier: user.subscriptionTier,
      role: user.role
    };
  }

  // NEW: Record order placement (to be called by order-service)
  recordOrderPlacement(userId) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const metrics = this.userMetrics.get(userId) || { ordersThisMonth: 0 };
    metrics.ordersThisMonth += 1;
    this.userMetrics.set(userId, metrics);
    
    user.updateLastActive();
    return this.getUserOrderCapacity(userId);
  }

  // NEW: Initialize user metrics
  initializeUserMetrics(userId) {
    this.userMetrics.set(userId, {
      ordersThisMonth: 0,
      totalOrders: 0,
      lastOrderDate: null
    });
  }

  // NEW: Reset monthly metrics (would be called by a scheduler)
  resetMonthlyMetrics() {
    for (const [userId, metrics] of this.userMetrics.entries()) {
      metrics.ordersThisMonth = 0;
      this.userMetrics.set(userId, metrics);
    }
  }

  // NEW: Get premium users
  getPremiumUsers() {
    return Array.from(this.users.values()).filter(user => user.isPremiumUser());
  }

  // NEW: Authenticate user (new endpoint that order-service might use)
  async authenticateUser(email, password) {
    const user = this.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const isValid = await user.verifyPassword(password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    
    user.updateLastActive();
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      canPlaceOrders: user.canPlaceOrders()
    };
  }
}

module.exports = UserService;
