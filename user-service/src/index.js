const express = require('express');
const cors = require('cors');
const UserController = require('./controllers/UserController');

const app = express();
const userController = new UserController();

app.use(cors());
app.use(express.json());

// Existing user routes
app.post('/users', userController.createUser);
app.get('/users', userController.getAllUsers);
app.get('/users/:id', userController.getUser);
app.put('/users/:id', userController.updateUser);
app.delete('/users/:id', userController.deleteUser);
app.get('/users/:id/status', userController.getUserStatus); // MODIFIED: Response structure changed

// NEW ROUTES that order-service will need to integrate with
app.get('/users/:id/order-capacity', userController.getUserOrderCapacity);
app.post('/users/:id/record-order', userController.recordOrder);
app.get('/users/eligible/orders', userController.getOrderEligibleUsers);
app.get('/users/premium/list', userController.getPremiumUsers);
app.put('/users/:id/subscription', userController.updateSubscription);
app.post('/auth/login', userController.authenticateUser);

// NEW: Batch operations (order-service might use for bulk validation)
app.post('/users/validate-batch', (req, res) => {
  try {
    const { userIds } = req.body;
    const results = userIds.map(id => {
      try {
        const capacity = userController.userService.getUserOrderCapacity(id);
        return { userId: id, valid: capacity.canPlaceOrder, capacity };
      } catch (error) {
        return { userId: id, valid: false, error: error.message };
      }
    });
    res.json(results);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'user-service',
    version: '2.0.0', // CHANGED: Version bump
    features: ['authentication', 'subscription-management', 'order-limits'] // NEW
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`User Service v2.0.0 running on port ${PORT}`);
});

module.exports = app;
