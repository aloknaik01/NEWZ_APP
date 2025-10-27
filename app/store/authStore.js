import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import axiosClient from "../api/axiosClient.js";

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,

  // Initialize - Check if user is logged in
  initialize: async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      const userStr = await AsyncStorage.getItem("user");

      if (accessToken && refreshToken && userStr) {
        const user = JSON.parse(userStr);
        set({ user, accessToken, refreshToken });
      }
    } catch (error) {
      console.error("Initialize error:", error);
    }
  },

  // Register
  register: async (fullName, email, password, referredByCode = "") => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosClient.post("/auth/register", {
        fullName,
        email,
        password,
        referredByCode,
      });

      if (data.success) {
        // Registration successful, but needs email verification
        set({ loading: false, error: null });
        return { 
          success: true, 
          message: data.message,
          needsVerification: true,
          email: email 
        };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed";
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  // Login
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosClient.post("/auth/login", {
        email,
        password,
      });

      if (data.success) {
        const { user, wallet, tokens } = data.data;

        // Save tokens
        await AsyncStorage.setItem("accessToken", tokens.accessToken);
        await AsyncStorage.setItem("refreshToken", tokens.refreshToken);

        // Save user data (include wallet)
        const userData = { ...user, wallet };
        await AsyncStorage.setItem("user", JSON.stringify(userData));

        set({
          user: userData,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          loading: false,
          error: null,
        });

        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed";
      const needsVerification = err.response?.data?.data?.needsVerification;

      set({ error: errorMsg, loading: false });
      return { 
        success: false, 
        message: errorMsg,
        needsVerification,
        email: email
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      
      if (refreshToken) {
        await axiosClient.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear local storage
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
      set({ user: null, accessToken: null, refreshToken: null });
    }
  },

  // Update user data (after profile edit, coin earn, etc.)
  updateUser: (updates) => {
    set((state) => {
      const updatedUser = { ...state.user, ...updates };
      AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },

  // Resend verification email
  resendVerification: async (email) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosClient.post("/auth/resend-verification", {
        email,
      });

      set({ loading: false });
      return { success: true, message: data.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to resend email";
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;