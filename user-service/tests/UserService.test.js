const UserService = require('../src/services/UserService');

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
  });

  test('should create a user', () => {
    const userData = { name: 'John Doe', email: 'john@example.com' };
    const user = userService.createUser(userData);
    
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
    expect(user.id).toBeDefined();
  });

  test('should not create user with duplicate email', () => {
    const userData = { name: 'John Doe', email: 'john@example.com' };
    userService.createUser(userData);
    
    expect(() => userService.createUser(userData)).toThrow('User with this email already exists');
  });

  test('should get user by id', () => {
    const userData = { name: 'John Doe', email: 'john@example.com' };
    const createdUser = userService.createUser(userData);
    const user = userService.getUserById(createdUser.id);
    
    expect(user).toEqual(createdUser);
  });

  test('should throw error for non-existent user', () => {
    expect(() => userService.getUserById('non-existent')).toThrow('User not found');
  });

  test('should get all users', () => {
    userService.createUser({ name: 'John', email: 'john@example.com' });
    userService.createUser({ name: 'Jane', email: 'jane@example.com' });
    
    const users = userService.getAllUsers();
    expect(users).toHaveLength(2);
  });

  test('should update user', () => {
    const user = userService.createUser({ name: 'John', email: 'john@example.com' });
    const updated = userService.updateUser(user.id, { name: 'John Updated' });
    
    expect(updated.name).toBe('John Updated');
  });

  test('should delete user', () => {
    const user = userService.createUser({ name: 'John', email: 'john@example.com' });
    userService.deleteUser(user.id);
    
    expect(() => userService.getUserById(user.id)).toThrow('User not found');
  });

  test('should get active users only', () => {
    userService.createUser({ name: 'John', email: 'john@example.com', status: 'active' });
    userService.createUser({ name: 'Jane', email: 'jane@example.com', status: 'inactive' });
    
    const activeUsers = userService.getActiveUsers();
    expect(activeUsers).toHaveLength(1);
    expect(activeUsers[0].name).toBe('John');
  });
});
