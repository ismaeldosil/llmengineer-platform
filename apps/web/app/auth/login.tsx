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
import { useLoginMutation } from '@/services/api';
import { setCredentials } from '@/store/slices/authSlice';
import { PasswordInput } from '@/components/atoms/PasswordInput';
import { validateEmail } from '@/utils/validation';
import { storage } from '@/utils/storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();

  // Real-time email validation
  useEffect(() => {
    if (touched.email && email) {
      const validation = validateEmail(email);
      setEmailError(validation.isValid ? '' : validation.error || '');
    }
  }, [email, touched.email]);

  const handleEmailBlur = () => {
    setTouched({ ...touched, email: true });
    const validation = validateEmail(email);
    setEmailError(validation.isValid ? '' : validation.error || '');
  };

  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
  };

  const isFormValid = () => {
    const emailValidation = validateEmail(email);
    return emailValidation.isValid && password.length > 0;
  };

  const handleLogin = async () => {
    // Validate all fields
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || '');
      setTouched({ email: true, password: true });
      return;
    }

    if (!password) {
      setTouched({ email: true, password: true });
      return;
    }

    try {
      const result = await login({ email, password }).unwrap();

      // Save to storage
      await storage.saveToken(result.accessToken);
      await storage.saveUser(result.user);

      // Update Redux
      dispatch(setCredentials({ user: result.user, token: result.accessToken }));

      // Navigate to dashboard
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace('/dashboard/' as any);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const getErrorMessage = () => {
    if (!error) return '';

    if ('status' in error) {
      if (error.status === 401) {
        return 'Email o contraseña incorrectos';
      }
      if (error.status === 429) {
        return 'Demasiados intentos. Por favor, intenta más tarde';
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

    return 'Error al iniciar sesión. Por favor, intenta de nuevo';
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Iniciar Sesión', headerBackVisible: true }} />
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
              <Text style={styles.title}>Bienvenido de vuelta</Text>
              <Text style={styles.subtitle}>Continúa tu viaje de aprendizaje</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  placeholder="tu@email.com"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  onBlur={handleEmailBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                {emailError && <Text style={styles.fieldError}>{emailError}</Text>}
              </View>

              <PasswordInput
                label="Contraseña"
                placeholder="Tu contraseña"
                value={password}
                onChangeText={setPassword}
                onBlur={handlePasswordBlur}
                error={touched.password && !password ? 'La contraseña es requerida' : ''}
                editable={!isLoading}
              />

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.error}>{getErrorMessage()}</Text>
                </View>
              )}

              <Pressable
                testID="login-submit-button"
                style={[styles.button, (isLoading || !isFormValid()) && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
                )}
              </Pressable>
            </View>

            <Pressable onPress={() => router.push('/auth/register')} disabled={isLoading}>
              <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
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
