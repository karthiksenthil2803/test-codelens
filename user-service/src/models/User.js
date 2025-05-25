const bcrypt = require('bcrypt');

class User {
  constructor(id, name, email, status = 'active', role = 'customer') {
    this.id = id;
    this.name = name;
    this.email = email;
    this.status = status;
    this.role = role; // NEW: customer, premium, admin
    this.subscriptionTier = 'basic'; // NEW: basic, premium, enterprise
    this.orderLimit = this.calculateOrderLimit(); // NEW: affects order-service
    this.lastActiveDate = new Date(); // NEW: for tracking user activity
    this.createdAt = new Date();
    this.passwordHash = null; // NEW: for authentication
  }

  validate() {
    if (!this.name || this.name.length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error('Valid email is required');
    }
    // MODIFIED: More restrictive status validation
    if (!['active', 'inactive', 'suspended', 'pending_verification'].includes(this.status)) {
      throw new Error('Invalid status');
    }
    // NEW: Role validation
    if (!['customer', 'premium', 'admin'].includes(this.role)) {
      throw new Error('Invalid user role');
    }
    // NEW: Subscription validation
    if (!['basic', 'premium', 'enterprise'].includes(this.subscriptionTier)) {
      throw new Error('Invalid subscription tier');
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // MODIFIED: More complex active check
  isActive() {
    const daysSinceLastActive = (new Date() - this.lastActiveDate) / (1000 * 60 * 60 * 24);
    return this.status === 'active' && daysSinceLastActive <= 90; // Auto-inactive after 90 days
  }

  // NEW: Check if user can place orders (impacts order-service)
  canPlaceOrders() {
    return this.isActive() && 
           this.status !== 'suspended' && 
           this.status !== 'pending_verification';
  }

  // NEW: Calculate order limits based on role and subscription
  calculateOrderLimit() {
    const limits = {
      customer: { basic: 5, premium: 20, enterprise: 50 },
      premium: { basic: 10, premium: 50, enterprise: 100 },
      admin: { basic: 100, premium: 200, enterprise: 500 }
    };
    return limits[this.role]?.[this.subscriptionTier] || 5;
  }

  // NEW: Set password (affects authentication)
  async setPassword(password) {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    this.passwordHash = await bcrypt.hash(password, 10);
  }

  // NEW: Verify password
  async verifyPassword(password) {
    if (!this.passwordHash) return false;
    return await bcrypt.compare(password, this.passwordHash);
  }

  deactivate() {
    this.status = 'inactive';
    this.lastActiveDate = new Date();
  }

  activate() {
    this.status = 'active';
    this.lastActiveDate = new Date();
  }

  // NEW: Upgrade subscription (affects order limits)
  upgradeSubscription(newTier) {
    const validTiers = ['basic', 'premium', 'enterprise'];
    if (!validTiers.includes(newTier)) {
      throw new Error('Invalid subscription tier');
    }
    this.subscriptionTier = newTier;
    this.orderLimit = this.calculateOrderLimit();
  }

  // NEW: Update user activity
  updateLastActive() {
    this.lastActiveDate = new Date();
  }

  // NEW: Check if user is premium
  isPremiumUser() {
    return this.role === 'premium' || this.subscriptionTier !== 'basic';
  }
}

module.exports = User;
