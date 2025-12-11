import {
  validateEmail,
  validatePassword,
  validateDisplayName,
  validatePasswordMatch,
  getPasswordStrength,
} from '../validation';

describe('validation utils', () => {
  describe('validateEmail', () => {
    it('should return valid for correct email', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El email es requerido');
    });

    it('should return invalid for malformed email', () => {
      const result = validateEmail('notanemail');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email inválido');
    });

    it('should return invalid for email without domain', () => {
      const result = validateEmail('test@');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email inválido');
    });

    it('should return invalid for email without @', () => {
      const result = validateEmail('testexample.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email inválido');
    });
  });

  describe('validatePassword', () => {
    it('should return valid for strong password', () => {
      const result = validatePassword('TestPass123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('La contraseña es requerida');
    });

    it('should return invalid for password less than 8 characters', () => {
      const result = validatePassword('Test12');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('La contraseña debe tener al menos 8 caracteres');
    });

    it('should return invalid for password without lowercase', () => {
      const result = validatePassword('TESTPASS123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Debe incluir al menos una letra minúscula');
    });

    it('should return invalid for password without uppercase', () => {
      const result = validatePassword('testpass123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Debe incluir al menos una letra mayúscula');
    });

    it('should return invalid for password without number', () => {
      const result = validatePassword('TestPassword');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Debe incluir al menos un número');
    });
  });

  describe('validateDisplayName', () => {
    it('should return valid for correct name', () => {
      const result = validateDisplayName('John Doe');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for empty name', () => {
      const result = validateDisplayName('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El nombre es requerido');
    });

    it('should return invalid for name less than 2 characters', () => {
      const result = validateDisplayName('A');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El nombre debe tener al menos 2 caracteres');
    });

    it('should return invalid for name more than 50 characters', () => {
      const result = validateDisplayName('A'.repeat(51));
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El nombre no puede exceder 50 caracteres');
    });

    it('should return valid for name with exactly 2 characters', () => {
      const result = validateDisplayName('AB');
      expect(result.isValid).toBe(true);
    });

    it('should return valid for name with exactly 50 characters', () => {
      const result = validateDisplayName('A'.repeat(50));
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePasswordMatch', () => {
    it('should return valid for matching passwords', () => {
      const result = validatePasswordMatch('TestPass123', 'TestPass123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for non-matching passwords', () => {
      const result = validatePasswordMatch('TestPass123', 'Different123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Las contraseñas no coinciden');
    });

    it('should return invalid for empty confirm password', () => {
      const result = validatePasswordMatch('TestPass123', '');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Las contraseñas no coinciden');
    });
  });

  describe('getPasswordStrength', () => {
    it('should return very weak for empty password', () => {
      const result = getPasswordStrength('');
      expect(result.score).toBe(0);
      expect(result.label).toBe('Muy débil');
      expect(result.color).toBe('#EF4444');
    });

    it('should return weak for short password', () => {
      const result = getPasswordStrength('test12');
      expect(result.score).toBe(1);
      expect(result.label).toBe('Débil');
    });

    it('should return acceptable for medium password', () => {
      const result = getPasswordStrength('testPass1');
      expect(result.score).toBeGreaterThanOrEqual(2);
      expect(result.label).toMatch(/Aceptable|Fuerte/);
    });

    it('should return strong for strong password', () => {
      const result = getPasswordStrength('TestPass123!');
      expect(result.score).toBeGreaterThanOrEqual(3);
      expect(result.label).toMatch(/Fuerte|Muy fuerte/);
    });

    it('should return very strong for very strong password', () => {
      const result = getPasswordStrength('TestPass123!@#$%');
      expect(result.score).toBe(4);
      expect(result.label).toBe('Muy fuerte');
      expect(result.color).toBe('#059669');
    });

    it('should cap score at 4', () => {
      const result = getPasswordStrength('VeryStrongP@ssw0rd123!@#');
      expect(result.score).toBeLessThanOrEqual(4);
    });
  });
});
