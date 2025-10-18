import { StyleSheet } from "react-native";
import { colors } from "../styles/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },

  // Header / Status
  statusBar: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  // Tabs
  tabsWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: colors.background,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabItemActive: {
    backgroundColor: colors.blackBackground,
    elevation: 3,
    shadowOpacity: 0.15,
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

  // News Card
  newsCard: {
    backgroundColor: colors.background,
    marginHorizontal: 12,
    marginVertical: 7,
    borderRadius: 12,
    padding: 14,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  newsSource: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "700",
  },
  newsTime: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: "500",
  },
  newsContent: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  imgWrapper: {
    width: 120,
    height: 90,
    borderRadius: 10,
    overflow: "hidden",
  },
  newsImage: {
    width: "100%",
    height: "100%",
  },
  newsBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  badgeText: {
    color: colors.background,
    fontSize: 9,
    fontWeight: "700",
  },
  newsText: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 21,
  },

  // Footer
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray,
  },

  // Bottom Nav
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    elevation: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 10,
    height: 70,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
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
