import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
    // Save tokens
    async saveTokens(accessToken, refreshToken) {
        try {
            await AsyncStorage.multiSet([
                ["accessToken", accessToken],
                ["refreshToken", refreshToken],
            ]);
            return true;
        } catch (error) {
            console.error("Error saving tokens:", error);
            return false;
        }
    },

    // Save user data
    async saveUser(user) {
        try {
            await AsyncStorage.setItem("user", JSON.stringify(user));
            return true;
        } catch (error) {
            console.error("Error saving user:", error);
            return false;
        }
    },

    // Get tokens
    async getTokens() {
        try {
            const tokens = await AsyncStorage.multiGet(["accessToken", "refreshToken"]);
            return {
                accessToken: tokens[0][1],
                refreshToken: tokens[1][1],
            };
        } catch (error) {
            console.error("Error getting tokens:", error);
            return { accessToken: null, refreshToken: null };
        }
    },

    // Get user
    async getUser() {
        try {
            const userData = await AsyncStorage.getItem("user");
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error("Error getting user:", error);
            return null;
        }
    },

    // Clear all data
    async clearAll() {
        try {
            await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
            return true;
        } catch (error) {
            console.error("Error clearing storage:", error);
            return false;
        }
    },
};