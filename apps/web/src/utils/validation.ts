export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'El email es requerido' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Email inválido' };
  }

  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'La contraseña es requerida' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, error: 'Debe incluir al menos una letra minúscula' };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, error: 'Debe incluir al menos una letra mayúscula' };
  }

  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, error: 'Debe incluir al menos un número' };
  }

  return { isValid: true };
};

export const validateDisplayName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'El nombre es requerido' };
  }

  if (name.length < 2) {
    return { isValid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }

  if (name.length > 50) {
    return { isValid: false, error: 'El nombre no puede exceder 50 caracteres' };
  }

  return { isValid: true };
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Las contraseñas no coinciden' };
  }

  return { isValid: true };
};

export interface PasswordStrength {
  score: number; // 0-4
  label: 'Muy débil' | 'Débil' | 'Aceptable' | 'Fuerte' | 'Muy fuerte';
  color: string;
}

export const getPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;

  if (!password) {
    return { score: 0, label: 'Muy débil', color: '#EF4444' };
  }

  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  const labels: Array<'Muy débil' | 'Débil' | 'Aceptable' | 'Fuerte' | 'Muy fuerte'> = [
    'Muy débil',
    'Débil',
    'Aceptable',
    'Fuerte',
    'Muy fuerte',
  ];

  const colors = ['#EF4444', '#F59E0B', '#FCD34D', '#10B981', '#059669'];

  return {
    score,
    label: labels[score],
    color: colors[score],
  };
};
