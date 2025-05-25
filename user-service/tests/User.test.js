const User = require('../src/models/User');

describe('User Model', () => {
  test('should create a valid user', () => {
    const user = new User('1', 'John Doe', 'john@example.com');
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
    expect(user.status).toBe('active');
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  test('should validate user data', () => {
    const user = new User('1', 'John', 'john@example.com');
    expect(() => user.validate()).not.toThrow();
  });

  test('should throw error for invalid name', () => {
    const user = new User('1', 'J', 'john@example.com');
    expect(() => user.validate()).toThrow('Name must be at least 2 characters long');
  });

  test('should throw error for invalid email', () => {
    const user = new User('1', 'John', 'invalid-email');
    expect(() => user.validate()).toThrow('Valid email is required');
  });

  test('should throw error for invalid status', () => {
    const user = new User('1', 'John', 'john@example.com', 'invalid');
    expect(() => user.validate()).toThrow('Invalid status');
  });

  test('should check if user is active', () => {
    const user = new User('1', 'John', 'john@example.com', 'active');
    expect(user.isActive()).toBe(true);
    
    user.status = 'inactive';
    expect(user.isActive()).toBe(false);
  });

  test('should activate and deactivate user', () => {
    const user = new User('1', 'John', 'john@example.com');
    user.deactivate();
    expect(user.status).toBe('inactive');
    
    user.activate();
    expect(user.status).toBe('active');
  });
});
