import React, { useState } from 'react';
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
import { COLORS } from '../constants/theme';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps): React.JSX.Element {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (isSignUp && !fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    try {
      setLoading(true);

      if (isSignUp) {
        const { error } = await signUp(email.trim(), password, fullName.trim());
        if (error) {
          const errorMessage = error instanceof Error ? error.message : 'Please try again';
          Alert.alert('Sign Up Failed', errorMessage);
          return;
        }
        Alert.alert('Success!', 'Account created successfully. You can now sign in.', [
          { text: 'OK', onPress: () => setIsSignUp(false) },
        ]);
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Please check your credentials';
          Alert.alert('Sign In Failed', errorMessage);
          return;
        }
        onAuthSuccess();
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
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
                }}
                placeholder="Full Name"
                placeholderTextColor={COLORS.text.muted}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            )}

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
              }}
              placeholder="Email"
              placeholderTextColor={COLORS.text.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />

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
              }}
              placeholder="Password"
              placeholderTextColor={COLORS.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
            />

            {/* Auth Button */}
            <TouchableOpacity
              className="rounded-xl p-4 items-center mt-2"
              style={{ backgroundColor: COLORS.pastel.blue }}
              onPress={handleAuth}
              disabled={loading}
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
              onPress={() => setIsSignUp(!isSignUp)}
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
