import { Dimensions, StyleSheet } from "react-native";
import { colors } from "./colors";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.lightGray,
    },

    // Header
    statusBar: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: "#ffffffff",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FF4B2B",
        letterSpacing: 0.5,

    },

    // ✅ Scroll Content
    imageContainer: {
        borderRadius: 16,
        overflow: "hidden",
        marginHorizontal: 16,
        marginTop: 16,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 5,
    },
    image: {
        width: width - 32,
        height: 240,
        resizeMode: "cover",
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: colors.text,
        marginHorizontal: 16,
        marginTop: 16,
    },
    meta: {
        fontSize: 14,
        color: colors.gray,
        marginHorizontal: 16,
        marginTop: 6,
        marginBottom: 12,
    },
    card: {
        backgroundColor: colors.background,
        padding: 16,
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.primary,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: colors.secondary,
        paddingLeft: 8,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: colors.text,
    },
    sourceRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    sourceIcon: {
        width: 28,
        height: 28,
        marginRight: 10,
        borderRadius: 6,
    },
    sourceText: {
        fontSize: 16,
        color: colors.secondary,
        textDecorationLine: "underline",
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 4,
    },
    tag: {
        backgroundColor: colors.primary,
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        color: colors.background,
        fontSize: 12,
        fontWeight: "600",
    },
    infoText: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 4,
    },


    // ✅ Centered Loading / No Data
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.lightGray,
    },
    noDataText: {
        fontSize: 18,
        color: colors.text,
        marginBottom: 12,
    },
});
