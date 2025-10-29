import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import useAuthStore from "./store/authStore";
import { colors } from "./styles/colors";
import { styles } from "./styles/formStyles";

// ✅ CRITICAL: Complete auth session
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const router = useRouter();
  const { login, register, loading, error, user, initialize, clearError } = useAuthStore();

  // ✅ FIXED: Proper Google OAuth Config
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "421191923633-9m8uko6m7g6kpejuj369rfbprvefio3m.apps.googleusercontent.com",
    iosClientId: "421191923633-1bsnqm7ekuls1npggchprqhkj6ij3maa.apps.googleusercontent.com",
    webClientId: "421191923633-i3euku8l714hrdd2j9ntin21uliglfu2.apps.googleusercontent.com",
  });

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (user) {
      router.replace("/home");
    }
  }, [user]);

  // ✅ Handle Google OAuth Response
  useEffect(() => {
    if (!response) return;

    if (response.type === "success") {
      const accessToken = response.authentication?.accessToken;
      if (accessToken) {
        handleGoogleSuccess(accessToken);
      } else {
        Alert.alert("Error", "Failed to get access token");
        setGoogleLoading(false);
      }
    } else if (response.type === "error") {
      console.error("Google Auth Error:", response.error);
      Alert.alert("Error", "Google authentication failed");
      setGoogleLoading(false);
    } else if (response.type === "dismiss" || response.type === "cancel") {
      setGoogleLoading(false);
    }
  }, [response]);

  const handleGoogleSuccess = async (accessToken) => {
    try {
      // Get user info from Google
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!userInfoResponse.ok) {
        throw new Error("Failed to fetch user info from Google");
      }

      const userInfo = await userInfoResponse.json();

      // Send to backend
      const BACKEND_URL = "http://10.37.147.108:5000";
      const backendResponse = await fetch(`${BACKEND_URL}/api/auth/google/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          googleAccessToken: accessToken,
          email: userInfo.email,
          name: userInfo.name,
          googleId: userInfo.id,
          profileImage: userInfo.picture,
        }),
      });

      const data = await backendResponse.json();

      if (data.success) {
        // Save tokens
        await AsyncStorage.setItem("accessToken", data.data.tokens.accessToken);
        await AsyncStorage.setItem("refreshToken", data.data.tokens.refreshToken);

        const userData = {
          ...data.data.user,
          wallet: data.data.wallet,
        };

        await AsyncStorage.setItem("user", JSON.stringify(userData));

        // Update store
        useAuthStore.setState({
          user: userData,
          accessToken: data.data.tokens.accessToken,
          refreshToken: data.data.tokens.refreshToken,
          loading: false,
          error: null,
        });

        Alert.alert("Success", "Google login successful!");
        router.replace("/home");
      } else {
        Alert.alert("Error", data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Google auth error:", error);
      Alert.alert("Error", "Failed to authenticate with Google. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setGoogleLoading(true);
      clearError();
      
      // ✅ Important: Check if request is ready
      if (!request) {
        Alert.alert("Error", "Google authentication not ready. Please try again.");
        setGoogleLoading(false);
        return;
      }

      await promptAsync();
    } catch (error) {
      console.error("Google Auth Error:", error);
      Alert.alert("Error", "Failed to initiate Google authentication");
      setGoogleLoading(false);
    }
  };

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

    if (isLogin) {
      const result = await login(email.toLowerCase().trim(), password);

      if (result.success) {
        Alert.alert("Success", "Login successful!");
      } else {
        if (result.needsVerification) {
          Alert.alert(
            "Email Not Verified",
            "Please verify your email before logging in. Check your inbox.",
            [
              { text: "OK", style: "cancel" },
              {
                text: "Resend Email",
                onPress: async () => {
                  const resendResult = await useAuthStore
                    .getState()
                    .resendVerification(email);
                  Alert.alert(
                    resendResult.success ? "Success" : "Error",
                    resendResult.message
                  );
                },
              },
            ]
          );
        } else {
          Alert.alert("Login Failed", result.message);
        }
      }
    } else {
      const result = await register(name.trim(), email.toLowerCase().trim(), password);

      if (result.success) {
        Alert.alert(
          "Registration Successful!",
          "Please check your email to verify your account before logging in.",
          [
            {
              text: "OK",
              onPress: () => {
                setIsLogin(true);
                setEmail("");
                setPassword("");
                setName("");
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
    clearError();
  };

  return (
    <>
      <StatusBar
        style="light"
        backgroundColor="#000000ff"
        translucent={false}
        barStyle="dark-content"
      />
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

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {isLogin && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

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

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In Button */}
            <TouchableOpacity
              onPress={handleGoogleAuth}
              activeOpacity={0.8}
              style={styles.googleButton}
              disabled={googleLoading || !request}
            >
              {googleLoading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <>
                  <Image
                    source={{ uri: "https://www.google.com/favicon.ico" }}
                    style={{ width: 20, height: 20 }}
                  />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
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