import { View, Text, FlatList, ImageBackground, StyleSheet, TouchableOpacity, Image } from "react-native";
import BottomNav from "./component/BottomNav";

// Dummy news array (20 repeated items)
const dummyNews = Array.from({ length: 20 }, (_, i) => ({
  article_id: `9a2b47e71bccf3008c7502920d36bfb8-${i}`,
  title: "Kada moda postane neugodna: Kako uska odjeća utječe na vaše zdravlje",
  link: "https://www.vecernji.ba/lifestyle/kada-moda-postane-neugodna-kako-uska-odjeca-utjece-na-vase-zdravlje-1900071",
  creator: ["vecernji.ba"],
  description: "Uska odjeća može naglasiti figuru i izgledati odlično, no pretjerano pripijeni komadi ponekad donose više štete nego koristi – od iritacija do probavnih problema.",
  pubDate: "2025-10-20 06:26:00",
  image_url: "https://www.vecernji.ba/media/img/f3/91/20bf84580ec2c28329a9.jpeg",
  source_icon: "https://n.bytvi.com/vecernji_ba.png",
}));

export default function History() {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <ImageBackground source={{ uri: item.image_url }} style={styles.image} imageStyle={{ borderRadius: 15 }}>
        <View style={styles.gradientOverlay} />
        <Text style={styles.title}>{item.title}</Text>
      </ImageBackground>
      <View style={styles.content}>
        <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
        <View style={styles.bottomRow}>
          <View style={styles.sourceRow}>
            <Image source={{ uri: item.source_icon }} style={styles.sourceIcon} />
            <Text style={styles.source}>{item.creator[0]}</Text>
          </View>
          <Text style={styles.date}>{new Date(item.pubDate).toLocaleDateString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <FlatList
        data={dummyNews}
        keyExtractor={(item) => item.article_id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  image: {
    height: 180,
    justifyContent: "flex-end",
    padding: 12,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    zIndex: 2,
  },
  content: {
    padding: 12,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sourceIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  source: {
    fontSize: 12,
    color: "#888",
  },
  date: {
    fontSize: 12,
    color: "#888",
  },
});
