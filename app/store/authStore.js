import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import axiosClient from "../api/axiosClient.js";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  initialize: async () => {
    const token = await AsyncStorage.getItem("token");
    const user = JSON.parse(await AsyncStorage.getItem("user"));
    if (token && user) set({ token, user });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosClient.post("/auth/login", { email, password });
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.errorMessage || "Login failed", loading: false });
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosClient.post("/auth/register", { name, email, password });
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.errorMessage || "Registration failed", loading: false });
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
