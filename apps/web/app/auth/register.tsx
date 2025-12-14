import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '@/services/api';
import { setCredentials } from '@/store/slices/authSlice';
import { PasswordInput } from '@/components/atoms/PasswordInput';
import { PasswordStrengthIndicator } from '@/components/atoms/PasswordStrengthIndicator';
import {
  validateEmail,
  validatePassword,
  validateDisplayName,
  validatePasswordMatch,
} from '@/utils/validation';
import { storage } from '@/utils/storage';

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState({
    displayName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [register, { isLoading, error }] = useRegisterMutation();
  const dispatch = useDispatch();

  // Real-time validation
  useEffect(() => {
    if (touched.displayName && displayName) {
      const validation = validateDisplayName(displayName);
      setErrors((prev) => ({
        ...prev,
        displayName: validation.isValid ? '' : validation.error || '',
      }));
    }
  }, [displayName, touched.displayName]);

  useEffect(() => {
    if (touched.email && email) {
      const validation = validateEmail(email);
      setErrors((prev) => ({
        ...prev,
        email: validation.isValid ? '' : validation.error || '',
      }));
    }
  }, [email, touched.email]);

  useEffect(() => {
    if (touched.password && password) {
      const validation = validatePassword(password);
      setErrors((prev) => ({
        ...prev,
        password: validation.isValid ? '' : validation.error || '',
      }));
    }
  }, [password, touched.password]);

  useEffect(() => {
    if (touched.confirmPassword && confirmPassword) {
      const validation = validatePasswordMatch(password, confirmPassword);
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validation.isValid ? '' : validation.error || '',
      }));
    }
  }, [password, confirmPassword, touched.confirmPassword]);

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isFormValid = () => {
    const displayNameValid = validateDisplayName(displayName).isValid;
    const emailValid = validateEmail(email).isValid;
    const passwordValid = validatePassword(password).isValid;
    const passwordMatchValid = validatePasswordMatch(password, confirmPassword).isValid;

    return displayNameValid && emailValid && passwordValid && passwordMatchValid;
  };

  const handleRegister = async () => {
    // Mark all fields as touched
    setTouched({
      displayName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // Validate all fields
    const displayNameValidation = validateDisplayName(displayName);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const passwordMatchValidation = validatePasswordMatch(password, confirmPassword);

    setErrors({
      displayName: displayNameValidation.isValid ? '' : displayNameValidation.error || '',
      email: emailValidation.isValid ? '' : emailValidation.error || '',
      password: passwordValidation.isValid ? '' : passwordValidation.error || '',
      confirmPassword: passwordMatchValidation.isValid ? '' : passwordMatchValidation.error || '',
    });

    if (!isFormValid()) {
      return;
    }

    try {
      const result = await register({ email, password, displayName }).unwrap();

      // Save to storage
      await storage.saveToken(result.accessToken);
      await storage.saveUser(result.user);

      // Update Redux
      dispatch(setCredentials({ user: result.user, token: result.accessToken }));

      // Navigate to dashboard
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace('/dashboard/' as any);
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const getErrorMessage = () => {
    if (!error) return '';

    if ('status' in error) {
      if (error.status === 409) {
        return 'Este email ya está registrado. Intenta iniciar sesión';
      }
      if (error.status === 400) {
        return 'Datos inválidos. Por favor, verifica la información';
      }
      if (
        'data' in error &&
        error.data &&
        typeof error.data === 'object' &&
        'message' in error.data
      ) {
        return (error.data as { message: string }).message;
      }
    }

    return 'Error al registrarse. Por favor, intenta de nuevo';
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Registrarse', headerBackVisible: true }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Crea tu cuenta</Text>
              <Text style={styles.subtitle}>Comienza tu viaje en LLM Engineering</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre de usuario</Text>
                <TextInput
                  style={[styles.input, errors.displayName ? styles.inputError : null]}
                  placeholder="Tu nombre"
                  placeholderTextColor="#6B7280"
                  value={displayName}
                  onChangeText={setDisplayName}
                  onBlur={() => handleBlur('displayName')}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                {errors.displayName && <Text style={styles.fieldError}>{errors.displayName}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, errors.email ? styles.inputError : null]}
                  placeholder="tu@email.com"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  onBlur={() => handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <PasswordInput
                  label="Contraseña"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChangeText={setPassword}
                  onBlur={() => handleBlur('password')}
                  error={errors.password}
                  editable={!isLoading}
                />
                {password && !errors.password && (
                  <View style={styles.strengthContainer}>
                    <PasswordStrengthIndicator password={password} />
                  </View>
                )}
              </View>

              <PasswordInput
                label="Confirmar contraseña"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onBlur={() => handleBlur('confirmPassword')}
                error={errors.confirmPassword}
                editable={!isLoading}
              />

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.error}>{getErrorMessage()}</Text>
                </View>
              )}

              <Pressable
                testID="register-submit-button"
                style={[styles.button, (isLoading || !isFormValid()) && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Crear Cuenta</Text>
                )}
              </Pressable>
            </View>

            <Pressable onPress={() => router.push('/auth/login')} disabled={isLoading}>
              <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  form: {
    gap: 20,
    marginBottom: 24,
  },
  inputGroup: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D5DB',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#374151',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  fieldError: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
  },
  strengthContainer: {
    marginTop: 12,
  },
  errorContainer: {
    backgroundColor: '#7F1D1D',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  error: {
    color: '#FCA5A5',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#3B82F6',
    fontSize: 14,
    textAlign: 'center',
  },
});
