import { supabase } from "../../lib/supabase";
import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import { router, Link } from "expo-router";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Completa email y contraseña");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            Alert.alert("Login error", error.message);
        } else {
            router.replace("/(tabs)");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>AI Companion</Text>

            <TextInput
                placeholder="Email"
                placeholderTextColor="#999"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                placeholder="Password"
                placeholderTextColor="#999"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Iniciar sesión</Text>
                )}
            </TouchableOpacity>

            {/* 👇 NUEVA OPCIÓN */}
            <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                    <Text style={styles.link}>
                        ¿No tienes usuario? Crear cuenta
                    </Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 40,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 14,
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: "#fff",
    },
    button: {
        backgroundColor: "#000",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    link: {
        textAlign: "center",
        color: "#4f46e5",
        fontWeight: "600",
    },
});