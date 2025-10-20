import { StyleSheet, Dimensions } from "react-native";
import { colors } from "./colors";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },

  // ✅ Enhanced Header
  statusBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  coinsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
  },
  coinsHeaderText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },

  // ✅ Enhanced Tabs
  tabsWrapper: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2,
  },
  tabItem: {
    position: "relative",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: colors.lightGray,
    elevation: 1,
  },
  tabItemActive: {
    backgroundColor: colors.blackBackground,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tabText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  // ✅ Enhanced News Card
  newsCard: {
    backgroundColor: colors.background,
    marginHorizontal: 14,
    marginVertical: 8,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  newsSource: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "700",
  },
  newsTime: {
    fontSize: 11,
    color: colors.gray,
    fontWeight: "500",
    marginTop: 2,
  },
  
  // ✅ Share Button
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },

  newsContent: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  imgWrapper: {
    width: 120,
    height: 90,
    borderRadius: 12,
    overflow: "hidden",
  },
  noImageWrapper: {
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  newsImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  newsBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },
  newsText: {
    flex: 1,
    justifyContent: "space-between",
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 21,
    marginBottom: 6,
  },
  newsDescription: {
    fontSize: 12,
    color: colors.gray,
    lineHeight: 18,
    fontWeight: "500",
  },

  // ✅ Coins Container
  coinsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  coinsBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    elevation: 3,
  },
  coinsText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  readMoreText: {
    fontSize: 11,
    color: colors.gray,
    fontWeight: "600",
    fontStyle: "italic",
  },

  // ✅ Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },

  // ✅ Enhanced Placeholder
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  placeholderSubtext: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray,
    textAlign: "center",
  },

  // ✅ Enhanced Bottom Nav
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    elevation: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  navWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 10,
    height: 70,
  },
  navItem: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },
  activeIndicator: {
    position: "absolute",
    top: -10,
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  navLabel: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 5,
    fontWeight: "600",
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: "700",
  },
});