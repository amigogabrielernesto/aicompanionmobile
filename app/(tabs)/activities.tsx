import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getActivities, updateActivityStatus } from "../../lib/api";
import { useUser } from "../../context/UserContext";

interface Activity {
  id: string;
  activity_type_id?: string;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
  suggested_at: string;
  activity_types_catalog?: {
    name: string;
  };
}

export default function ActivitiesScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const { token } = useUser();

  const fetchActivities = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getActivities(token);
      setActivities(Array.isArray(data) ? data : (data.activities || []));
    } catch (error) {
      console.error("Error fetching activities:", error);
      Alert.alert("Error", "No se pudieron cargar las actividades.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const filteredActivities = activities.filter(act => 
    filter === 'all' ? true : act.status === filter
  );

  const handleUpdateStatus = async (id: string, status: 'completed' | 'pending' | 'cancelled') => {
    if (!token) return;
    try {
      await updateActivityStatus(id, status, token, 0); // score 0 default
      setActivities((prev) =>
        prev.map((act) => (act.id === id ? { ...act, status } : act))
      );
    } catch (error: any) {
      console.error("Error updating activity:", error);
      Alert.alert("Error", `No se pudo actualizar el estado: ${error.message || ""}`);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return { label: 'Cumplida', color: '#10b981', icon: 'checkmark-circle' as const };
      case 'cancelled': return { label: 'No realizada', color: '#ef4444', icon: 'close-circle' as const };
      default: return { label: 'Pendiente', color: '#f59e0b', icon: 'time' as const };
    }
  };

  const renderItem = ({ item }: { item: Activity }) => {
    const statusInfo = getStatusInfo(item.status || 'pending');
    
    return (
      <View style={styles.activityCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.activityTitle}>
            {item.activity_types_catalog?.name || "Actividad Sugerida"}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Ionicons name={statusInfo.icon} size={12} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}> {statusInfo.label}</Text>
          </View>
        </View>
        
        <Text style={styles.descriptionText}>{item.description}</Text>
        
        <Text style={styles.dateText}>Sugerida el: {new Date(item.suggested_at).toLocaleDateString()}</Text>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.completeBtn]} 
            onPress={() => handleUpdateStatus(item.id, 'completed')}
            disabled={item.status === 'completed'}
          >
            <Ionicons name="checkmark" size={16} color="white" />
            <Text style={styles.actionText}>Cumplida</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.pendingBtn]} 
            onPress={() => handleUpdateStatus(item.id, 'pending')}
            disabled={item.status === 'pending'}
          >
            <Ionicons name="time-outline" size={16} color="white" />
            <Text style={styles.actionText}>Pendiente</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelBtn]} 
            onPress={() => handleUpdateStatus(item.id, 'cancelled')}
            disabled={item.status === 'cancelled'}
          >
            <Ionicons name="close-outline" size={16} color="white" />
            <Text style={styles.actionText}>No haré</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Actividades Sugeridas</Text>
        <TouchableOpacity onPress={fetchActivities} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity 
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]} 
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, filter === 'pending' && styles.filterChipActive]} 
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterText, filter === 'pending' && styles.filterChipActive]}>Pendientes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, filter === 'completed' && styles.filterChipActive]} 
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>Cumplidas</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, filter === 'cancelled' && styles.filterChipActive]} 
            onPress={() => setFilter('cancelled')}
          >
            <Text style={[styles.filterText, filter === 'cancelled' && styles.filterTextActive]}>Canceladas</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={filteredActivities}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                {filter === 'all' 
                  ? "No tienes actividades sugeridas aún." 
                  : `No hay actividades ${
                      filter === 'pending' ? 'pendientes' : 
                      filter === 'completed' ? 'cumplidas' : 'canceladas'
                    }.`
                }
              </Text>
            </View>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  refreshButton: {
    padding: 8,
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  filterBar: {
    marginBottom: 5,
    paddingHorizontal: 20,
  },
  filterScroll: {
    paddingVertical: 10,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
  },
  filterChipActive: {
    backgroundColor: "#6366f1",
    borderColor: "#818cf8",
  },
  filterText: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "white",
  },
  activityCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  activityTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  descriptionText: {
    color: "#888",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  dateText: {
    color: "#555",
    fontSize: 11,
    marginBottom: 15,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  actionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  completeBtn: {
    backgroundColor: "#10b981",
  },
  pendingBtn: {
    backgroundColor: "#f59e0b",
  },
  cancelBtn: {
    backgroundColor: "#ef4444",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
  },
});
