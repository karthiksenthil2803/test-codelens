const UserService = require('../services/UserService');

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  createUser = async (req, res) => {
    try {
      const user = this.userService.createUser(req.body);
      // NEW: Set password if provided
      if (req.body.password) {
        await user.setPassword(req.body.password);
      }
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  getUser = (req, res) => {
    try {
      const user = this.userService.getUserById(req.params.id);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  };

  getAllUsers = (req, res) => {
    try {
      const users = this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  updateUser = (req, res) => {
    try {
      const user = this.userService.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  deleteUser = (req, res) => {
    try {
      this.userService.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  };

  // MODIFIED: Enhanced status response that will break order-service
  getUserStatus = (req, res) => {
    try {
      const user = this.userService.getUserById(req.params.id);
      // BREAKING CHANGE: Response structure changed
      res.json({ 
        userId: user.id, // CHANGED: was 'id'
        userStatus: user.status, // CHANGED: was 'status'
        isActiveUser: user.isActive(), // CHANGED: was 'isActive'
        canCreateOrders: user.canPlaceOrders(), // NEW: critical for order-service
        accountType: user.role, // NEW
        subscription: user.subscriptionTier, // NEW
        orderingCapacity: this.userService.getUserOrderCapacity(user.id) // NEW
      });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  };

  // NEW: Get user order capacity (order-service will need this)
  getUserOrderCapacity = (req, res) => {
    try {
      const capacity = this.userService.getUserOrderCapacity(req.params.id);
      res.json(capacity);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  };

  // NEW: Record order placement (order-service should call this)
  recordOrder = (req, res) => {
    try {
      const result = this.userService.recordOrderPlacement(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  // NEW: Get eligible users for orders
  getOrderEligibleUsers = (req, res) => {
    try {
      const users = this.userService.getUsersEligibleForOrders();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // NEW: Authenticate user
  authenticateUser = async (req, res) => {
    try {
      const { email, password } = req.body;
      const authResult = await this.userService.authenticateUser(email, password);
      res.json(authResult);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  };

  // NEW: Get premium users
  getPremiumUsers = (req, res) => {
    try {
      const users = this.userService.getPremiumUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // NEW: Update subscription
  updateSubscription = (req, res) => {
    try {
      const user = this.userService.updateUser(req.params.id, {
        subscriptionTier: req.body.subscriptionTier
      });
      res.json({
        userId: user.id,
        subscriptionTier: user.subscriptionTier,
        newOrderLimit: user.orderLimit
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}

module.exports = UserController;
