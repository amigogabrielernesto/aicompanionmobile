import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useUser } from "../../context/UserContext";

export default function HomeScreen() {
  const { user, profile, logout } = useUser();
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

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
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
    backgroundColor: "#ef4444",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});