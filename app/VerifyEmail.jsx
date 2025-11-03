// app/verifyEmail.jsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar
} from "react-native";
import axiosClient from "./api/axiosClient";

const colors = {
  primary: "#FF4B2B",
  secondary: "#FF416C",
  text: "#333333",
  gray: "#A9A9A9",
  lightGray: "#F5F5F5",
  background: "#FFFFFF",
};

export default function VerifyEmail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(120); // 2 minutes countdown
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input
  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits entered
    if (newOtp.every((digit) => digit !== "") && index === 5) {
      handleVerify(newOtp.join(""));
    }
  };

  // Handle backspace
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Shake animation
  const shakeInputs = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Verify OTP
  const handleVerify = async (code) => {
    setLoading(true);
    try {
      const response = await axiosClient.post("/auth/verify-email", {
        email,
        otp: code || otp.join(""),
      });

      if (response.data.success) {
        Alert.alert("Success! 🎉", response.data.message, [
          {
            text: "Login Now",
            onPress: () => router.replace("/"),
          },
        ]);
      }
    } catch (error) {
      shakeInputs();
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      Alert.alert(
        "Verification Failed",
        error.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend) return;

    setResending(true);
    try {
      const response = await axiosClient.post("/auth/resend-verification", {
        email,
      });

      if (response.data.success) {
        Alert.alert("OTP Sent", "New verification code sent to your email!");
        setTimer(120);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to resend OTP"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.iconContainer}>
            <Ionicons name="mail-open" size={80} color="#fff" />
          </View>
          
          <Text style={styles.headerTitle}>Verify Your Email</Text>
          <Text style={styles.headerSubtitle}>
            We've sent a 6-digit code to{"\n"}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.label}>Enter Verification Code</Text>

            <Animated.View
              style={[
                styles.otpContainer,
                { transform: [{ translateX: shakeAnimation }] },
              ]}
            >
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  autoFocus={index === 0}
                />
              ))}
            </Animated.View>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Verifying...</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.verifyButton,
                (loading || otp.some((d) => d === "")) && styles.verifyButtonDisabled,
              ]}
              onPress={() => handleVerify()}
              disabled={loading || otp.some((d) => d === "")}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.gradient}
              >
                <Text style={styles.verifyButtonText}>Verify Email</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.timerContainer}>
              {!canResend ? (
                <>
                  <Ionicons name="time-outline" size={18} color={colors.gray} />
                  <Text style={styles.timerText}>
                    Resend code in {formatTime(timer)}
                  </Text>
                </>
              ) : (
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={resending}
                  style={styles.resendButton}
                >
                  {resending ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Ionicons name="refresh" size={18} color={colors.primary} />
                      <Text style={styles.resendText}>Resend Code</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                Didn't receive the code? Check your spam folder or click resend.
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 22,
  },
  emailText: {
    fontWeight: "700",
    color: "#FFD700",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    backgroundColor: colors.lightGray,
  },
  otpInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.gray,
  },
  verifyButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  gradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  timerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  timerText: {
    fontSize: 14,
    color: colors.gray,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#E65100",
    lineHeight: 18,
  },
});