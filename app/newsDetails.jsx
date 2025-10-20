import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Dimensions,
    Image,
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "react-native-web";
import useNewsStore from "./store/newsStore";
import { styles } from "./styles/newsDeatalsStyles";

export default function NewsDetails() {
    const router = useRouter();
    const { selectedNews } = useNewsStore();

    if (!selectedNews) {
        return (
            <View style={styles.centered}>
                <Text style={styles.noDataText}>No news data found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.goBackBtn}>
                    <Text style={styles.goBackText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.statusBar}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={24} color="#FF4B2B" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>News Details</Text>
                        </View>
                    </View>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* Article Image */}
                    {selectedNews.image_url && (
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: selectedNews.image_url }}
                                style={styles.image}
                            />
                        </View>
                    )}

                    {/* Title */}
                    <Text style={styles.title}>{selectedNews.title}</Text>

                    {/* Creator & Date */}
                    <Text style={styles.meta}>
                        By {(selectedNews.creator || []).join(", ")} |{" "}
                        {selectedNews.pubDate
                            ? new Date(selectedNews.pubDate).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "Date not available"}
                    </Text>

                    {/* Description Card */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>
                            {selectedNews.description || "No description available."}
                        </Text>
                    </View>

                    {/* Content Card */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Content</Text>
                        <Text style={styles.description}>
                            {selectedNews.content || "Full content is available only in paid plans."}
                        </Text>
                    </View>

                    {/* Source Card */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Source</Text>
                        <View style={styles.sourceRow}>
                            {selectedNews.source_icon && (
                                <Image
                                    source={{ uri: selectedNews.source_icon }}
                                    style={styles.sourceIcon}
                                />
                            )}
                            <TouchableOpacity
                                onPress={() => Linking.openURL(selectedNews.source_url)}
                            >
                                <Text style={styles.sourceText}>{selectedNews.source_name}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Keywords */}
                    {(selectedNews.keywords || []).length > 0 && (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Keywords</Text>
                            <View style={styles.tagsContainer}>
                                {(selectedNews.keywords || []).map((tag, index) => (
                                    <View key={index} style={styles.tag}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Categories */}
                    {(selectedNews.category || []).length > 0 && (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Categories</Text>
                            <View style={styles.tagsContainer}>
                                {(selectedNews.category || []).map((cat, index) => (
                                    <View key={index} style={styles.tag}>
                                        <Text style={styles.tagText}>{cat}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Additional Info */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Additional Info</Text>
                        <Text style={styles.infoText}>Language: {selectedNews.language}</Text>
                        <Text style={styles.infoText}>
                            Country: {(selectedNews.country || []).join(", ")}
                        </Text>
                        <Text style={styles.infoText}>
                            Duplicate: {selectedNews.duplicate ? "Yes" : "No"}
                        </Text>
                    </View>

                    {/* Go Back Button
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.goBackBtnMain}
                    >
                        <Text style={styles.goBackTextMain}>Go Back</Text>
                    </TouchableOpacity> */}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}


