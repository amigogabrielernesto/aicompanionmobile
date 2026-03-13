import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { sendMessage } from "../../lib/api";
import { useUser } from "../../context/UserContext";

type Task = {
    title: string;
    description: string;
};

type ChatMessage = {
    role: "user" | "assistant";
    content: string;
    tasks?: Task[];
    time: number;
};

export default function ChatScreen() {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState<ChatMessage[]>([]);
    const [sending, setSending] = useState(false);

    const flatListRef = useRef<FlatList>(null);

    const { token } = useUser();
    const { initialMessage } = useLocalSearchParams<{ initialMessage?: string }>();

    // mensaje inicial del asistente
    useEffect(() => {
        setChat([
            {
                role: "assistant",
                content: "Hola 👋 Soy tu AI Companion. ¿Cómo te sientes hoy?",
                time: Date.now()
            }
        ]);
    }, []);

    // scroll automático al último mensaje
    useEffect(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, [chat]);

    // mensaje automático desde check-in
    useEffect(() => {
        if (initialMessage && token && chat.length <= 1) {
            handleAutoSend(initialMessage);
        }
    }, [initialMessage, token]);

    async function handleAutoSend(msg: string) {
        setChat(prev => [
            ...prev,
            { role: "user", content: msg, time: Date.now() }
        ]);

        setSending(true);

        try {
            const res = await sendMessage(msg, token!);

            setChat(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: res.message ?? res.reply,
                    tasks: res.tasks ?? [],
                    time: Date.now()
                }
            ]);
        } catch (error: any) {
            console.error("Error sending initial message:", error);
            
            let errorMsg = "Error: No se pudo conectar con el servidor.";
            if (error.message) {
                errorMsg = `Error: ${error.message}`;
            }

            setChat(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: errorMsg,
                    time: Date.now()
                }
            ]);
        } finally {
            setSending(false);
        }
    }

    async function handleSend() {
        if (!message.trim() || sending) return;
        if (!token) return;

        const userMsg = message.trim();

        setChat(prev => [
            ...prev,
            { role: "user", content: userMsg, time: Date.now() }
        ]);

        setMessage("");
        setSending(true);

        try {
            const res = await sendMessage(userMsg, token);

            setChat(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: res.message ?? res.reply,
                    tasks: res.tasks ?? [],
                    time: Date.now()
                }
            ]);
        } catch (error: any) {
            console.error("Error sending message:", error);

            let errorMsg = "Error: No se pudo conectar con el servidor.";
            if (error.message) {
                errorMsg = `Error: ${error.message}`;
            }

            setChat(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: errorMsg,
                    time: Date.now()
                }
            ]);
        } finally {
            setSending(false);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={100}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>AI Companion Chat</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={chat}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.messageBubble,
                            item.role === "user"
                                ? styles.userBubble
                                : styles.aiBubble
                        ]}
                    >
                        <Text style={styles.roleLabel}>
                            {item.role === "user" ? "Tú" : "AI"}
                        </Text>

                        <Text style={styles.messageText}>{item.content}</Text>

                        {/* tareas sugeridas por la IA */}
                        {item.tasks && item.tasks.length > 0 && (
                            <View style={styles.tasksContainer}>
                                {item.tasks.map((task, index) => (
                                    <View key={index} style={styles.taskCard}>
                                        <Text style={styles.taskTitle}>
                                            {task.title}
                                        </Text>
                                        <Text style={styles.taskDescription}>
                                            {task.description}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <Text style={styles.timeText}>
                            {new Date(item.time).toLocaleDateString([], {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit"
                            })}{" "}
                            {new Date(item.time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                        </Text>
                    </View>
                )}
            />

            <View style={styles.inputArea}>
                <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Escribe un mensaje..."
                    placeholderTextColor="#666"
                    multiline
                />

                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!message.trim() || sending) && styles.disabledButton
                    ]}
                    onPress={handleSend}
                    disabled={!message.trim() || sending}
                >
                    {sending ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text style={styles.sendButtonText}>➤</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f0f0f"
    },

    header: {
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: "#1a1a1a",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#333"
    },

    headerTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold"
    },

    listContent: {
        padding: 20,
        paddingBottom: 40
    },

    messageBubble: {
        padding: 15,
        borderRadius: 20,
        marginBottom: 15,
        maxWidth: "85%"
    },

    userBubble: {
        backgroundColor: "#6366f1",
        alignSelf: "flex-end",
        borderBottomRightRadius: 5
    },

    aiBubble: {
        backgroundColor: "#2a2a2a",
        alignSelf: "flex-start",
        borderBottomLeftRadius: 5
    },

    roleLabel: {
        fontSize: 10,
        fontWeight: "bold",
        color: "rgba(255,255,255,0.5)",
        marginBottom: 4,
        textTransform: "uppercase"
    },

    messageText: {
        color: "white",
        fontSize: 16
    },

    tasksContainer: {
        marginTop: 10
    },

    taskCard: {
        backgroundColor: "#1f2937",
        padding: 10,
        borderRadius: 10,
        marginTop: 6
    },

    taskTitle: {
        color: "#a5b4fc",
        fontWeight: "bold"
    },

    taskDescription: {
        color: "#e5e7eb",
        fontSize: 13
    },

    timeText: {
        fontSize: 10,
        color: "rgba(255,255,255,0.5)",
        alignSelf: "flex-end",
        marginTop: 6
    },

    inputArea: {
        flexDirection: "row",
        padding: 15,
        backgroundColor: "#1a1a1a",
        borderTopWidth: 1,
        borderTopColor: "#333",
        alignItems: "flex-end"
    },

    input: {
        flex: 1,
        backgroundColor: "#2a2a2a",
        color: "white",
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        maxHeight: 100
    },

    sendButton: {
        backgroundColor: "#6366f1",
        borderRadius: 20,
        paddingHorizontal: 18,
        height: 40,
        justifyContent: "center",
        alignItems: "center"
    },

    disabledButton: {
        backgroundColor: "#444"
    },

    sendButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold"
    }
});