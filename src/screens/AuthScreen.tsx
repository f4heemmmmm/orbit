import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { signIn, signUp } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/theme';
import {
  validateEmail,
  validatePasswordForSignIn,
  validatePasswordForSignUp,
  validateFullName,
  getAuthErrorMessage,
  isNetworkError,
} from '../utils/authValidation';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

interface FormErrors {
  email: string | null;
  password: string | null;
  fullName: string | null;
}

const INITIAL_ERRORS: FormErrors = {
  email: null,
  password: null,
  fullName: null,
};

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps): React.JSX.Element {
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>(INITIAL_ERRORS);

  // Clear specific field error when user starts typing
  const handleEmailChange = useCallback(
    (text: string) => {
      setEmail(text);
      if (errors.email) {
        setErrors(prev => ({ ...prev, email: null }));
      }
    },
    [errors.email]
  );

  const handlePasswordChange = useCallback(
    (text: string) => {
      setPassword(text);
      if (errors.password) {
        setErrors(prev => ({ ...prev, password: null }));
      }
    },
    [errors.password]
  );

  const handleFullNameChange = useCallback(
    (text: string) => {
      setFullName(text);
      if (errors.fullName) {
        setErrors(prev => ({ ...prev, fullName: null }));
      }
    },
    [errors.fullName]
  );

  // Validate all fields and return whether form is valid
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = { ...INITIAL_ERRORS };
    let isValid = true;

    // Validate email
    const emailResult = validateEmail(email);
    if (!emailResult.isValid) {
      newErrors.email = emailResult.error;
      isValid = false;
    }

    // Validate password
    const passwordResult = isSignUp
      ? validatePasswordForSignUp(password)
      : validatePasswordForSignIn(password);
    if (!passwordResult.isValid) {
      newErrors.password = passwordResult.error;
      isValid = false;
    }

    // Validate full name for sign-up
    if (isSignUp) {
      const nameResult = validateFullName(fullName);
      if (!nameResult.isValid) {
        newErrors.fullName = nameResult.error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [email, password, fullName, isSignUp]);

  const handleAuth = async (): Promise<void> => {
    Keyboard.dismiss();

    // Run validation
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (isSignUp) {
        const { error } = await signUp(email.trim(), password, fullName.trim());
        if (error) {
          const errorMessage = getAuthErrorMessage(error);

          // Check if error is related to email (for inline display)
          if (
            errorMessage.toLowerCase().includes('email') &&
            errorMessage.toLowerCase().includes('exists')
          ) {
            setErrors(prev => ({ ...prev, email: errorMessage }));
          } else {
            Alert.alert('Sign Up Failed', errorMessage);
          }
          return;
        }
        Alert.alert('Success!', 'Account created successfully. You can now sign in.', [
          {
            text: 'OK',
            onPress: () => {
              setIsSignUp(false);
              setPassword(''); // Clear password for security
            },
          },
        ]);
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          const errorMessage = getAuthErrorMessage(error);

          // Show network errors with retry option
          if (isNetworkError(error)) {
            Alert.alert('Connection Error', errorMessage, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Retry', onPress: handleAuth },
            ]);
          } else {
            Alert.alert('Sign In Failed', errorMessage);
          }
          return;
        }
        onAuthSuccess();
      }
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle mode toggle and clear errors
  const handleModeToggle = useCallback(() => {
    setIsSignUp(!isSignUp);
    setErrors(INITIAL_ERRORS);
    setPassword(''); // Clear password when switching modes
  }, [isSignUp]);

  // Render inline error message
  const renderError = (errorMessage: string | null) => {
    if (!errorMessage) {
      return null;
    }
    return (
      <Text style={{ color: COLORS.pastel.red, marginTop: 4, marginLeft: 4 }} className="text-xs">
        {errorMessage}
      </Text>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      style={{ backgroundColor: COLORS.background }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center px-6">
          {/* Header */}
          <View className="items-center mb-10">
            <Text style={{ color: COLORS.text.primary }} className="text-4xl font-bold mb-2">
              Orbit
            </Text>
            <Text style={{ color: COLORS.text.secondary }} className="text-base">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            {isSignUp && (
              <View>
                <TextInput
                  className="rounded-xl"
                  style={{
                    backgroundColor: COLORS.card,
                    color: COLORS.text.primary,
                    paddingHorizontal: 16,
                    paddingVertical: 0,
                    height: 56,
                    fontSize: 16,
                    lineHeight: 20,
                    includeFontPadding: false,
                    borderWidth: errors.fullName ? 1 : 0,
                    borderColor: errors.fullName ? COLORS.pastel.red : 'transparent',
                  }}
                  placeholder="Full Name"
                  placeholderTextColor={COLORS.text.muted}
                  value={fullName}
                  onChangeText={handleFullNameChange}
                  autoCapitalize="words"
                  editable={!loading}
                />
                {renderError(errors.fullName)}
              </View>
            )}

            <View>
              <TextInput
                className="rounded-xl"
                style={{
                  backgroundColor: COLORS.card,
                  color: COLORS.text.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 0,
                  height: 56,
                  fontSize: 16,
                  lineHeight: 20,
                  includeFontPadding: false,
                  borderWidth: errors.email ? 1 : 0,
                  borderColor: errors.email ? COLORS.pastel.red : 'transparent',
                }}
                placeholder="Email"
                placeholderTextColor={COLORS.text.muted}
                value={email}
                onChangeText={handleEmailChange}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!loading}
              />
              {renderError(errors.email)}
            </View>

            <View>
              <TextInput
                className="rounded-xl"
                style={{
                  backgroundColor: COLORS.card,
                  color: COLORS.text.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 0,
                  height: 56,
                  fontSize: 16,
                  lineHeight: 20,
                  includeFontPadding: false,
                  borderWidth: errors.password ? 1 : 0,
                  borderColor: errors.password ? COLORS.pastel.red : 'transparent',
                }}
                placeholder="Password"
                placeholderTextColor={COLORS.text.muted}
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                editable={!loading}
              />
              {renderError(errors.password)}
            </View>

            {/* Auth Button */}
            <TouchableOpacity
              className="rounded-xl p-4 items-center mt-2"
              style={{
                backgroundColor: loading ? COLORS.surface : COLORS.pastel.blue,
                opacity: loading ? 0.7 : 1,
              }}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <Text style={{ color: COLORS.background }} className="text-base font-semibold">
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle Sign Up/Sign In */}
            <TouchableOpacity
              className="items-center mt-4"
              onPress={handleModeToggle}
              disabled={loading}
            >
              <Text style={{ color: COLORS.text.secondary }} className="text-sm">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={{ color: COLORS.pastel.blue }} className="font-semibold">
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
