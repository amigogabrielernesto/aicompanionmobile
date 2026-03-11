import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from "react-native";
import { useRouter } from "expo-router";
import { saveCheckIn } from "../../lib/api";
import { useUser } from "../../context/UserContext";

export default function CheckInScreen() {
    const [mood, setMood] = useState<string | null>(null);
    const [energy, setEnergy] = useState(5);
    const [stress, setStress] = useState(5);
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const { token } = useUser();
    const router = useRouter();

    const moods = [
        "😀 Feliz",
        "😌 Tranquilo",
        "😐 Neutral",
        "😔 Triste",
        "😡 Estresado",
    ];

    async function handleSubmit() {
        if (!mood) return;

        if (!token) {
            Alert.alert("Error", "No se encontró una sesión activa.");
            return;
        }

        setLoading(true);
        try {
            await saveCheckIn({
                mood,
                energy,
                stress,
                notes: note
            }, token);

            Alert.alert("Éxito", "Check-in guardado con éxito !!!!🚀", [
                {
                    text: "OK",
                    onPress: () => router.push({
                        pathname: "/chat",
                        params: { initialMessage: note }
                    } as any)
                }
            ]);
        } catch (error) {
            console.error("Error saving check-in:", error);
            Alert.alert("Error", "Hubo un error al guardar el check-in.");
        } finally {
            setLoading(false);
        }
    }

    const renderSlider = (label: string, value: number, onChange: (val: number) => void) => (
        <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>{label}</Text>
                <Text style={styles.sliderValue}>{value}/10</Text>
            </View>
            <View style={styles.sliderBarBackground}>
                <View style={[styles.sliderBarForeground, { width: `${value * 10}%` }]} />
            </View>
            <View style={styles.sliderButtons}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <TouchableOpacity
                        key={num}
                        onPress={() => onChange(num)}
                        style={[styles.sliderStep, value === num && styles.sliderStepActive]}
                    >
                        <Text style={[styles.sliderStepText, value === num && styles.sliderStepTextActive]}>{num}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Check-In Diario</Text>
                        <Text style={styles.subtitle}>¿Hola, Soy tu acompañante de VidaSana, estoy aquí para acompañarte en tu progreso. Como te sientes hoy?</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Estado de ánimo</Text>
                        <View style={styles.moodGrid}>
                            {moods.map((m) => (
                                <TouchableOpacity
                                    key={m}
                                    onPress={() => setMood(m)}
                                    style={[styles.moodCard, mood === m && styles.moodCardActive]}
                                >
                                    <Text style={styles.moodEmoji}>{m.split(' ')[0]}</Text>
                                    <Text style={styles.moodText}>{m.split(' ')[1]}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {renderSlider("Energía", energy, setEnergy)}
                    {renderSlider("Estrés", stress, setStress)}

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Reflexión personal</Text>
                        <TextInput
                            style={styles.textArea}
                            value={note}
                            onChangeText={setNote}
                            placeholder="¿Algo que quieras destacar?"
                            placeholderTextColor="#666"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, (!mood || loading) && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={!mood || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.submitButtonText}>Guardar Check-In</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: "#0f0f0f",
    },
    content: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
    },
    subtitle: {
        fontSize: 14,
        color: "#888",
        marginTop: 5,
    },
    section: {
        marginBottom: 25,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#888",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 15,
    },
    moodGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    moodCard: {
        width: "31%",
        backgroundColor: "#1a1a1a",
        borderRadius: 15,
        padding: 15,
        alignItems: "center",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#333",
    },
    moodCardActive: {
        backgroundColor: "#6366f1",
        borderColor: "#818cf8",
    },
    moodEmoji: {
        fontSize: 24,
        marginBottom: 5,
    },
    moodText: {
        color: "white",
        fontSize: 10,
        fontWeight: "600",
    },
    sliderContainer: {
        marginBottom: 25,
        backgroundColor: "#161616",
        padding: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#222",
    },
    sliderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    sliderLabel: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#888",
        textTransform: "uppercase",
    },
    sliderValue: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#6366f1",
    },
    sliderBarBackground: {
        height: 6,
        backgroundColor: "#333",
        borderRadius: 3,
        marginBottom: 15,
        overflow: "hidden",
    },
    sliderBarForeground: {
        height: "100%",
        backgroundColor: "#6366f1",
    },
    sliderButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    sliderStep: {
        width: 25,
        height: 25,
        borderRadius: 12.5,
        backgroundColor: "#222",
        justifyContent: "center",
        alignItems: "center",
    },
    sliderStepActive: {
        backgroundColor: "#6366f1",
    },
    sliderStepText: {
        color: "#666",
        fontSize: 10,
        fontWeight: "bold",
    },
    sliderStepTextActive: {
        color: "white",
    },
    textArea: {
        backgroundColor: "#1a1a1a",
        color: "white",
        borderRadius: 15,
        padding: 15,
        fontSize: 14,
        height: 120,
        textAlignVertical: "top",
        borderWidth: 1,
        borderColor: "#333",
    },
    submitButton: {
        backgroundColor: "#6366f1",
        height: 55,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    disabledButton: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});
