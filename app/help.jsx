import React, { useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, LayoutAnimation, Platform, UIManager } from "react-native";
import BottomNav from "./component/BottomNav";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "./styles/colors";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqs = [
  { question: "New app kya hai?", answer: "Ye app aapko latest news, tutorials aur guides provide karta hai." },
  { question: "Kaise earn karte hai?", answer: "Aap app ke referral program aur in-app tasks ke through earn kar sakte hai." },
  { question: "Account kaise banaye?", answer: "Sign up button pe click kare aur apni details fill kare." },
  { question: "Password recover kaise kare?", answer: "Login page pe 'Forgot Password' pe click kare aur instructions follow kare." },
  { question: "Profile edit kaise kare?", answer: "Profile tab me jaake Edit button pe click kare aur changes save kare." },
  { question: "Notifications kaise enable kare?", answer: "Settings me jaake notifications toggle on kare." },
  { question: "Subscription plans kya hai?", answer: "Free aur premium plans available hai, details subscription tab me milegi." },
  { question: "App offline kaise use kare?", answer: "Offline mode ke liye content pehle download kare." },
  { question: "Data privacy kaise ensure hoti hai?", answer: "Humari privacy policy ke according aapka data secure aur encrypted hai." },
  { question: "Contact support kaise kare?", answer: "Help tab me 'Contact Us' option se humse directly contact kare." },
  { question: "App update kaise kare?", answer: "Play Store ya App Store se latest version update kare." },
  { question: "App ka size kitna hai?", answer: "App ka approximate size 50MB hai." },
  { question: "Multiple devices pe use kar sakte hai?", answer: "Haan, same account se multiple devices pe login kar sakte hai." },
  { question: "Referral bonus kaise milega?", answer: "Apne referral code se friends ko invite kare aur bonus automatically add ho jayega." },
  { question: "Payment methods kya hai?", answer: "Credit card, debit card aur UPI supported hai." },
  { question: "Report a bug kaise kare?", answer: "Help tab me 'Report a Bug' section me details submit kare." },
  { question: "Language change kaise kare?", answer: "Settings me jaake preferred language select kare." },
  { question: "Content share kaise kare?", answer: "Article ke share button pe click karke social media ya WhatsApp me share kare." },
  { question: "App uninstall karne ke baad data milega?", answer: "Haan, aapka account cloud me saved hai, reinstall ke baad login kare." },
  { question: "Terms & conditions kaise dekhe?", answer: "Settings ya Help tab me 'Terms & Conditions' section me read kare." },
];

const AccordionItem = ({ item }) => {
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
        <Text style={[styles.icon, expanded && { transform: [{ rotate: "45deg" }] }]}>+</Text>
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
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {faqs.map((faq, index) => (
          <AccordionItem key={index} item={faq} />
        ))}
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
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
  icon: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.secondary,
    transform: [{ rotate: "0deg" }],
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
});
