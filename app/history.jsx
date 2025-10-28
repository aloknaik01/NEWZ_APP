import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, LayoutAnimation, Platform, UIManager, Linking, Alert } from "react-native";
import BottomNav from "./component/BottomNav";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "./styles/colors";
import { Ionicons } from "@expo/vector-icons";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqs = [
  { 
    question: "App kya hai?", 
    answer: "Ye app aapko latest news padhne aur coins earn karne ka mauka deta hai. Aap daily news articles padh kar coins earn kar sakte hai aur referral program ke through extra rewards paa sakte hai." 
  },
  { 
    question: "Kaise coins earn karte hai?", 
    answer: "Aap kisi bhi article ko kam se kam 30 seconds tak padhne par 10 coins earn karte hai. Daily limit 50 articles hai. 7 din tak lagatar padhne par 50 bonus coins bhi milte hai." 
  },
  { 
    question: "Daily limit kya hai?", 
    answer: "Aap ek din me maximum 50 articles padh sakte hai. Iske baad coins nahi milenge. Ye limit har raat 12 baje reset ho jati hai." 
  },
  { 
    question: "Referral program kaise kaam karta hai?", 
    answer: "Apne referral code se friends ko invite karo. Jab wo sign up karte hai to aapko 100 coins bonus milta hai. Aapka referral code Profile section me milega." 
  },
  { 
    question: "Coins ka kya kare?", 
    answer: "Filhal aap apne coins wallet me dekh sakte hai. Jald hi redemption feature aayega jisme aap coins ko cash ya rewards me convert kar paoge." 
  },
  { 
    question: "Account kaise banaye?", 
    answer: "Sign up button pe click kare, apna naam, email aur password dale. Email verification ke baad aap login kar sakte hai. Google se bhi sign up kar sakte hai." 
  },
  { 
    question: "Email verify kaise kare?", 
    answer: "Sign up ke baad aapke email par verification link aayega. Us link pe click karke email verify kare. Agar email nahi aaya to 'Resend Email' button use kare." 
  },
  { 
    question: "Password bhool gaye?", 
    answer: "Login page pe 'Forgot Password' pe click kare aur apna email enter kare. Aapko password reset link email par milega." 
  },
  { 
    question: "Profile edit kaise kare?", 
    answer: "Profile tab me jaake apni details edit kar sakte hai. Naam, gender, age, phone number change kar sakte hai." 
  },
  { 
    question: "Reading history kaise dekhe?", 
    answer: "History tab me jaake aap apni saari padhi hui articles dekh sakte hai. Kitne coins earn kiye wo bhi dikhega." 
  },
  { 
    question: "7 day streak bonus kya hai?", 
    answer: "Agar aap lagatar 7 din articles padhte hai to aapko 50 coins ka bonus milega. Ek din miss karne par streak reset ho jayegi." 
  },
  { 
    question: "Coins kab milte hai?", 
    answer: "Article ko 30 seconds se zyada padhne ke baad coins automatically aapke wallet me add ho jate hai. Notification bhi aata hai." 
  },
  { 
    question: "News categories konsi hai?", 
    answer: "All, Lifestyle, Health, Education, Business, Technology, World - ye sabhi categories available hai. Aap koi bhi category select kar sakte hai." 
  },
  { 
    question: "Article share kaise kare?", 
    answer: "Kisi bhi article pe share button hai. Us par click karke WhatsApp, Facebook ya kahi bhi share kar sakte hai." 
  },
  { 
    question: "Logout kaise kare?", 
    answer: "Profile tab me jaake niche 'Logout' button hai. Us par click kare." 
  },
  { 
    question: "Account delete kaise kare?", 
    answer: "Profile me 'Request Account Deletion' button hai. Request submit hone ke baad 7 din me aapka account delete ho jayega." 
  },
  { 
    question: "Support se contact kaise kare?", 
    answer: "Koi problem ho to support@newsapp.com par email kare ya profile me feedback option use kare." 
  },
  { 
    question: "Google se login kaise kare?", 
    answer: "Login page pe 'Continue with Google' button pe click kare. Apna Google account select kare aur login ho jayega." 
  },
  { 
    question: "App ka size kitna hai?", 
    answer: "App ka approximate size 50-60MB hai depending on device." 
  },
  { 
    question: "Offline kaam karta hai?", 
    answer: "Nahi, internet connection zaroori hai news articles padhne aur coins earn karne ke liye." 
  },
];

const AccordionItem = ({ item, index }) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.85} style={styles.accordionHeader}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.leftStrip}
        />
        <Text style={styles.question}>{item.question}</Text>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={22} 
          color={colors.secondary}
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.answerContainer}>
          <Text style={styles.answer}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
};

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState(faqs);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFaqs(faqs);
    } else {
      const filtered = faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFaqs(filtered);
    }
  }, [searchQuery]);

  const handleContactSupport = () => {
    Alert.alert(
      "Contact Support",
      "Choose how you want to contact us:",
      [
        {
          text: "Email",
          onPress: () => Linking.openURL("mailto:support@newsapp.com?subject=Support Request")
        },
        {
          text: "WhatsApp",
          onPress: () => Linking.openURL("https://wa.me/1234567890?text=Hi, I need help with the News App")
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={handleContactSupport}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <AccordionItem key={index} item={faq} index={index} />
          ))
        ) : (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={60} color={colors.gray} />
            <Text style={styles.noResultsText}>No FAQs found</Text>
            <Text style={styles.noResultsSubtext}>Try different keywords</Text>
          </View>
        )}

        {/* Contact Card */}
        <View style={styles.contactCard}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.contactGradient}
          >
            <Ionicons name="help-circle" size={40} color="#fff" />
            <Text style={styles.contactTitle}>Still Need Help?</Text>
            <Text style={styles.contactText}>
              Our support team is here to help you 24/7
            </Text>
            <TouchableOpacity 
              style={styles.contactActionButton}
              onPress={handleContactSupport}
            >
              <Text style={styles.contactActionText}>Contact Support</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
      
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  accordionItem: {
    marginBottom: 15,
    borderRadius: 25,
    backgroundColor: colors.lightGray,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 25,
  },
  leftStrip: {
    width: 6,
    height: "100%",
    borderRadius: 3,
    marginRight: 15,
  },
  question: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.primary,
    flex: 1,
  },
  answerContainer: {
    padding: 20,
    backgroundColor: colors.background,
  },
  answer: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 8,
  },
  contactCard: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  contactGradient: {
    padding: 30,
    alignItems: "center",
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginTop: 12,
  },
  contactText: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  contactActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  contactActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
});