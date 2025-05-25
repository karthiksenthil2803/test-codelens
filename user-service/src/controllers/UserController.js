const UserService = require('../services/UserService');

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  createUser = (req, res) => {
    try {
      const user = this.userService.createUser(req.body);
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

  getUserStatus = (req, res) => {
    try {
      const user = this.userService.getUserById(req.params.id);
      res.json({ id: user.id, status: user.status, isActive: user.isActive() });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  };
}

module.exports = UserController;
