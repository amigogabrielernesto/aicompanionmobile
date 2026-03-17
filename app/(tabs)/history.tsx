import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { getHistory } from "../../lib/api";

interface ChatMessage {
  id: string;
  turn_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface HistoryItem {
  id: string;
  created_at: string;
  messages: ChatMessage[];
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  const fetchHistory = useCallback(async (pageNum: number) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        console.error("No token found");
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      const limit = 20;
      const data = await getHistory(token, pageNum, limit);

      // Handle both { checkins: [...] } and direct array [...] responses
      const checkins = Array.isArray(data) ? data : (data?.checkins || data?.messages || []);

      if (Array.isArray(checkins)) {
        if (pageNum === 1) {
          setHistory(checkins);
        } else {
          setHistory((prev) => [...prev, ...checkins]);
        }
        
        // Determine if there are more pages
        if (data.pagination) {
          setHasMore(data.pagination.page < data.pagination.totalPages);
        } else {
          // Fallback if pagination object is missing
          setHasMore(checkins.length === limit);
        }
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHistory(nextPage);
    }
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.checkinContainer}>
      <View style={styles.checkinHeader}>
        <Ionicons name="calendar-outline" size={16} color="#a5b4fc" />
        <Text style={styles.checkinDate}>
          Sesión: {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
      
      {item.messages && item.messages.map((msg) => (
        <View key={msg.id} style={[
          styles.historyCard, 
          msg.role === 'assistant' ? styles.assistantCard : styles.userCard
        ]}>
          <View style={styles.cardHeader}>
            <Text style={styles.roleText}>
              {msg.role === 'assistant' ? '🤖 AI' : '👤 Tú'}
            </Text>
            <Text style={styles.cardDate}>
              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <Text style={styles.contentBody}>{msg.content}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && page === 1 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>No hay registros de historial.</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color="#6366f1" style={{ marginVertical: 20 }} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    padding: 8,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  checkinContainer: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    paddingBottom: 16,
  },
  checkinHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#1a1a1a",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  checkinDate: {
    color: "#a5b4fc",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 6,
  },
  historyCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  userCard: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333",
    alignSelf: 'flex-end',
    width: '90%',
  },
  assistantCard: {
    backgroundColor: "#312e81",
    borderColor: "#4338ca",
    alignSelf: 'flex-start',
    width: '90%',
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  roleText: {
    color: "#a5b4fc",
    fontWeight: "bold",
    fontSize: 12,
  },
  cardDate: {
    color: "#888",
    fontSize: 10,
  },
  contentBody: {
    color: "white",
    fontSize: 14,
    lineHeight: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
  },
});
