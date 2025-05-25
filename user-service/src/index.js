const express = require('express');
const cors = require('cors');
const UserController = require('./controllers/UserController');

const app = express();
const userController = new UserController();

app.use(cors());
app.use(express.json());

// User routes
app.post('/users', userController.createUser);
app.get('/users', userController.getAllUsers);
app.get('/users/:id', userController.getUser);
app.put('/users/:id', userController.updateUser);
app.delete('/users/:id', userController.deleteUser);
app.get('/users/:id/status', userController.getUserStatus);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'user-service' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});

module.exports = app;
