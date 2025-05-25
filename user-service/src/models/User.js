class User {
  constructor(id, name, email, status = 'active') {
    this.id = id;
    this.name = name;
    this.email = email;
    this.status = status;
    this.createdAt = new Date();
  }

  validate() {
    if (!this.name || this.name.length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error('Valid email is required');
    }
    if (!['active', 'inactive', 'suspended'].includes(this.status)) {
      throw new Error('Invalid status');
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isActive() {
    return this.status === 'active';
  }

  deactivate() {
    this.status = 'inactive';
  }

  activate() {
    this.status = 'active';
  }
}

module.exports = User;
