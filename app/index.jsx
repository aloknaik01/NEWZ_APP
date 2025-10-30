import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (user) {
      router.replace("/home");
    }
  }, [user]);

  // ✅ IMPROVED: Better token extraction with multiple patterns
  const extractTokenFromUrl = (url) => {
    console.log("🔍 Full URL:", url);
    
    // Try multiple patterns
    const patterns = [
      /access_token=([^&]+)/,
      /[#&]access_token=([^&]+)/,
      /#access_token=([^&]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        console.log("✅ Token found with pattern:", pattern);
        return match[1];
      }
    }

    // Check if URL contains the full response
    if (url.includes('access_token=')) {
      const parts = url.split('access_token=');
      if (parts[1]) {
        const token = parts[1].split('&')[0];
        console.log("✅ Token extracted manually");
        return token;
      }
    }

    console.error("❌ No token found in URL");
    return null;
  };

  const handleGoogleAuth = async () => {
    try {
      setGoogleLoading(true);
      clearError();

      const GOOGLE_CLIENT_ID = "421191923633-vduj7jaejl0ilpftq8k7ce31gl1dq5d9.apps.googleusercontent.com";
      const REDIRECT_URI = "newzz://oauth2redirect";
      
      const authUrl = 
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent("profile email")}&` +
        `prompt=select_account`;

      console.log("🚀 Opening Google login...");
      console.log("📍 Redirect URI:", REDIRECT_URI);

      const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

      console.log("📦 Result type:", result.type);
      console.log("📦 Result:", JSON.stringify(result, null, 2));

      if (result.type === "success") {
        const accessToken = extractTokenFromUrl(result.url);
        
        if (accessToken) {
          console.log("✅ Access token obtained");
          await handleGoogleSuccess(accessToken);
        } else {
          console.error("❌ Failed to extract token from:", result.url);
          Alert.alert(
            "Authentication Error",
            "Could not get access token. Please try again.",
            [
              {
                text: "Retry",
                onPress: () => handleGoogleAuth()
              },
              {
                text: "Cancel",
                style: "cancel"
              }
            ]
          );
          setGoogleLoading(false);
        }
      } else if (result.type === "cancel") {
        console.log("👤 User cancelled authentication");
        setGoogleLoading(false);
      } else if (result.type === "dismiss") {
        console.log("👤 User dismissed authentication");
        setGoogleLoading(false);
      } else {
        console.error("❌ Authentication failed:", result.type);
        Alert.alert("Error", "Authentication failed. Please try again.");
        setGoogleLoading(false);
      }
    } catch (error) {
      console.error("💥 Google auth error:", error);
      Alert.alert("Error", error.message || "Authentication failed");
      setGoogleLoading(false);
    }
  };

  const handleGoogleSuccess = async (accessToken) => {
    try {
      console.log("🔑 Fetching user info from Google...");
      
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!userInfoResponse.ok) {
        throw new Error(`Google API error: ${userInfoResponse.status}`);
      }

      const userInfo = await userInfoResponse.json();
      console.log("✅ User info received:", userInfo.email);

      console.log("📤 Sending to backend...");
      const BACKEND_URL = "http://10.37.147.108:5000";
      const backendResponse = await fetch(`${BACKEND_URL}/api/auth/google/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleAccessToken: accessToken,
          email: userInfo.email,
          name: userInfo.name,
          googleId: userInfo.id,
          profileImage: userInfo.picture,
        }),
      });

      const data = await backendResponse.json();
      console.log("📥 Backend response:", data.success ? "Success" : "Failed");

      if (data.success) {
        console.log("💾 Saving tokens to storage...");
        
        await AsyncStorage.setItem("accessToken", data.data.tokens.accessToken);
        await AsyncStorage.setItem("refreshToken", data.data.tokens.refreshToken);
        
        const userData = { ...data.data.user, wallet: data.data.wallet };
        await AsyncStorage.setItem("user", JSON.stringify(userData));

        useAuthStore.setState({
          user: userData,
          accessToken: data.data.tokens.accessToken,
          refreshToken: data.data.tokens.refreshToken,
          loading: false,
          error: null,
        });

        console.log("✅ Authentication complete!");
        Alert.alert("Success", "Google login successful!");
        router.replace("/home");
      } else {
        console.error("❌ Backend error:", data.message);
        Alert.alert("Error", data.message || "Authentication failed");
        setGoogleLoading(false);
      }
    } catch (error) {
      console.error("💥 handleGoogleSuccess error:", error);
      Alert.alert("Error", error.message || "Failed to authenticate");
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
            "Please verify your email before logging in.",
            [
              { text: "OK", style: "cancel" },
              {
                text: "Resend Email",
                onPress: async () => {
                  const resendResult = await useAuthStore.getState().resendVerification(email);
                  Alert.alert(resendResult.success ? "Success" : "Error", resendResult.message);
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
          "Please check your email to verify your account.",
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
      <StatusBar style="light" backgroundColor="#000000ff" translucent={false} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.heroSection}>
            <View style={styles.illustrationWrapper}>
              <View style={styles.illustrationBg}>
                <View style={styles.mainIconCircle}>
                  <Ionicons name="newspaper" size={60} color={colors.primary} />
                </View>
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.dollarBadge}>
                  <Text style={styles.dollarSymbol}>$</Text>
                </LinearGradient>
                <View style={styles.trendingBadge}>
                  <Ionicons name="trending-up" size={14} color={colors.secondary} />
                </View>
              </View>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                <Text style={{ color: colors.primary }}>Read News</Text>{"\n"}
                <Text style={{ color: colors.secondary }}>& Earn Money</Text>
              </Text>
            </View>
            <Text style={styles.subtitle}>Stay informed with latest news and{"\n"}earn rewards for your time</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.tabContainer}>
              <TouchableOpacity onPress={toggleMode} style={[styles.tab, !isLogin && styles.tabInactive]}>
                {isLogin ? (
                  <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.tabGradient}>
                    <Text style={styles.tabTextActive}>Login</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tabTextInactive}>Login</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleMode} style={[styles.tab, isLogin && styles.tabInactive]}>
                {!isLogin ? (
                  <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.tabGradient}>
                    <Text style={styles.tabTextActive}>Register</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tabTextInactive}>Register</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>{isLogin ? "Welcome back!" : "Get started!"}</Text>
              <Text style={styles.formSubtitle}>{isLogin ? "Sign in to continue" : "Create account"}</Text>
            </View>

            {!isLogin && (
              <View style={styles.inputWrapper}>
                <View style={[styles.inputContainer, nameFocused && styles.inputContainerFocused]}>
                  <Ionicons name="person-outline" size={20} color={nameFocused ? colors.primary : colors.gray} style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={colors.gray} value={name} onChangeText={setName} onFocus={() => setNameFocused(true)} onBlur={() => setNameFocused(false)} />
                </View>
              </View>
            )}

            <View style={styles.inputWrapper}>
              <View style={[styles.inputContainer, emailFocused && styles.inputContainerFocused]}>
                <Ionicons name="mail-outline" size={20} color={emailFocused ? colors.primary : colors.gray} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.gray} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)} />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <View style={[styles.inputContainer, passwordFocused && styles.inputContainerFocused]}>
                <Ionicons name="lock-closed-outline" size={20} color={passwordFocused ? colors.primary : colors.gray} style={styles.inputIcon} />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Password" placeholderTextColor={colors.gray} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.gray} />
                </TouchableOpacity>
              </View>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity onPress={handleSubmit} style={styles.submitButtonWrapper} disabled={loading}>
              <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.submitButton}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{isLogin ? "Sign in" : "Create account"}</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity onPress={handleGoogleAuth} style={styles.googleButton} disabled={googleLoading}>
              {googleLoading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <>
                  <Image source={{ uri: "https://www.google.com/favicon.ico" }} style={{ width: 20, height: 20 }} />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By continuing, you agree to our <Text style={styles.termsLink}>Terms</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}