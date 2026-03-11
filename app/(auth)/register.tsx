import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [country, setCountry] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!fullName.trim()) {
            Alert.alert("Error", "El nombre completo es obligatorio");
            return;
        }

        if (!email || !password) {
            Alert.alert("Error", "Completa email y contraseña");
            return;
        }

        setLoading(true);

        // 1️⃣ Crear usuario en Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setLoading(false);
            Alert.alert("Error", error.message);
            return;
        }

        const userId = data.user?.id;

        if (!userId) {
            setLoading(false);
            Alert.alert("Error", "No se pudo obtener el usuario");
            return;
        }

        // 2️⃣ Insertar datos en profiles
        const { error: profileError } = await supabase
            .from("profiles")
            .update({
                fullname: fullName,
                country: country,
            })
            .eq("id", userId)

        setLoading(false);

        if (profileError) {
            Alert.alert("Error perfil", profileError.message);
            return;
        }

        Alert.alert("Éxito", "Usuario creado correctamente 🎉");
        router.replace("/(auth)/login");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Crear cuenta</Text>

            <TextInput
                placeholder="Nombre completo"
                placeholderTextColor="#888"
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
            />

            <TextInput
                placeholder="País"
                placeholderTextColor="#888"
                style={styles.input}
                value={country}
                onChangeText={setCountry}
            />

            <TextInput
                placeholder="Email"
                placeholderTextColor="#888"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Registrarme</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f0f0f",
        justifyContent: "center",
        padding: 24,
    },
    title: {
        fontSize: 24,
        color: "white",
        marginBottom: 30,
        fontWeight: "bold",
    },
    input: {
        backgroundColor: "#1f1f1f",
        color: "white",
        padding: 14,
        borderRadius: 8,
        marginBottom: 16,
    },
    button: {
        backgroundColor: "#10b981",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
});