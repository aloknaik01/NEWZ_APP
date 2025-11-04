// app/index.jsx - UPDATED with Referral Code
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import useAuthStore from "./store/authStore";
import { colors } from "./styles/colors";
import { styles } from "./styles/formStyles";

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [referralFocused, setReferralFocused] = useState(false);

  const router = useRouter();
  const { login, register, loading, error, user, initialize, clearError } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (user) {
      router.replace("/home");
    }
  }, [user]);

  const handleSubmit = async () => {
    clearError();

    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (!isLogin && !name) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (!isLogin && password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    // Validate referral code format if provided
    if (!isLogin && referralCode && referralCode.length !== 8) {
      Alert.alert("Error", "Referral code must be 8 characters");
      return;
    }

    if (isLogin) {
      const result = await login(email.toLowerCase().trim(), password);

      if (result.success) {
        Alert.alert("Success", "Login successful!");
      } else {
        if (result.needsVerification) {
          Alert.alert(
            "Email Not Verified",
            "Please verify your email before logging in.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Verify Now",
                onPress: () => {
                  // Navigate to OTP verification screen
                  router.push({
                    pathname: "/verifyEmail",
                    params: { email }
                  });
                },
              },
            ]
          );
        } else {
          Alert.alert("Login Failed", result.message);
        }
      }
    } else {
      // Pass referral code to register
      const result = await register(
        name.trim(),
        email.toLowerCase().trim(),
        password,
        referralCode.toUpperCase().trim() || null
      );

      if (result.success) {
        Alert.alert(
          "Registration Successful! ",
          result.signupBonusEarned > 0
            ? `You earned ${result.signupBonusEarned} coins as signup bonus!\n\n Your referrer will earn their bonus after you read 20 articles!`
            : result.message,
          [
            {
              text: "Verify Email",
              onPress: () => {
                router.push({
                  pathname: "/verifyEmail",
                  params: { email: email.toLowerCase().trim() }
                });
              },
            },
          ]
        );
      } else {
        Alert.alert("Registration Failed", result.message);
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setName("");
    setEmail("");
    setPassword("");
    setReferralCode(""); // Clear referral code
    clearError();
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.illustrationWrapper}>
              <View style={styles.illustrationBg}>
                <View style={styles.mainIconCircle}>
                  <Ionicons name="newspaper" size={60} color={colors.primary} />
                </View>
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.dollarBadge}
                >
                  <Text style={styles.dollarSymbol}>$</Text>
                </LinearGradient>
                <View style={styles.trendingBadge}>
                  <Ionicons name="trending-up" size={14} color={colors.secondary} />
                </View>
              </View>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                <Text style={{ color: colors.primary }}>Read News</Text>
                {"\n"}
                <Text style={{ color: colors.secondary }}>& Earn Money</Text>
              </Text>
            </View>
            <Text style={styles.subtitle}>
              Stay informed with latest news and{"\n"}earn rewards for your time
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                onPress={toggleMode}
                activeOpacity={0.7}
                style={[styles.tab, !isLogin && styles.tabInactive]}
              >
                {isLogin ? (
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tabGradient}
                  >
                    <Text style={styles.tabTextActive}>Login</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tabTextInactive}>Login</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleMode}
                activeOpacity={0.7}
                style={[styles.tab, isLogin && styles.tabInactive]}
              >
                {!isLogin ? (
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tabGradient}
                  >
                    <Text style={styles.tabTextActive}>Register</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tabTextInactive}>Register</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {isLogin ? "Welcome back!" : "Get started!"}
              </Text>
              <Text style={styles.formSubtitle}>
                {isLogin
                  ? "Sign in to continue earning"
                  : "Create account and start earning"}
              </Text>
            </View>

            {/* Name Input (Register only) */}
            {!isLogin && (
              <View style={styles.inputWrapper}>
                <View
                  style={[
                    styles.inputContainer,
                    nameFocused && styles.inputContainerFocused,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={nameFocused ? colors.primary : colors.gray}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Full name"
                    placeholderTextColor={colors.gray}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                  />
                </View>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <View
                style={[
                  styles.inputContainer,
                  emailFocused && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={emailFocused ? colors.primary : colors.gray}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={colors.gray}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <View
                style={[
                  styles.inputContainer,
                  passwordFocused && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={passwordFocused ? colors.primary : colors.gray}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Password"
                  placeholderTextColor={colors.gray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={colors.gray}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Referral Code Input (Register only) */}
            {!isLogin && (
              <View style={styles.inputWrapper}>
                <View
                  style={[
                    styles.inputContainer,
                    referralFocused && styles.inputContainerFocused,
                  ]}
                >
                  <Ionicons
                    name="gift-outline"
                    size={20}
                    color={referralFocused ? colors.primary : colors.gray}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Referral code (optional)"
                    placeholderTextColor={colors.gray}
                    value={referralCode}
                    onChangeText={(text) => setReferralCode(text.toUpperCase())}
                    autoCapitalize="characters"
                    maxLength={8}
                    onFocus={() => setReferralFocused(true)}
                    onBlur={() => setReferralFocused(false)}
                  />
                  {referralCode.length > 0 && (
                    <TouchableOpacity onPress={() => setReferralCode("")}>
                      <Ionicons name="close-circle" size={20} color={colors.gray} />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.referralHint}>
                  Have a referral code? Enter it to give your friend a bonus!
                </Text>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Forgot Password (Login only) */}
            {isLogin && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.8}
              style={styles.submitButtonWrapper}
              disabled={loading}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isLogin ? "Sign in" : "Create account"}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Terms Text */}
            <Text style={styles.termsText}>
              By continuing, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

//  referral hint style
const additionalStyles = StyleSheet.create({
  referralHint: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 6,
    fontStyle: "italic",
  },
});