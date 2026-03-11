import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser } from "../../context/UserContext";

export default function HomeScreen() {
  const { user, profile, logout } = useUser();
  const router = useRouter();
  const displayName = profile?.fullname || user?.email || "Usuario";
  const displayAvatar = (profile?.fullname || user?.email || "?").charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>AI Companion</Text>
          <Text style={styles.email}>{displayName}</Text>
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayAvatar}
          </Text>
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenido 👋</Text>

        <TouchableOpacity 
          style={[styles.button, styles.checkinButton]} 
          onPress={() => router.push("/checkin")}
        >
          <Ionicons name="checkbox-outline" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Daily Check-in</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.chatButton]} 
          onPress={() => router.push("/chat")}
        >
          <Ionicons name="chatbubble-outline" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>AI Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.historyButton]} 
          onPress={() => router.push("/history")}
        >
          <Ionicons name="time-outline" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  label: {
    fontSize: 12,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  email: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 22,
    marginBottom: 30,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    marginBottom: 15,
  },
  checkinButton: {
    backgroundColor: "#10b981",
  },
  chatButton: {
    backgroundColor: "#6366f1",
  },
  historyButton: {
    backgroundColor: "#4b5563",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});