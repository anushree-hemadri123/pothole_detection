import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView, Alert, RefreshControl } from 'react-native';
import axios from 'axios';
import { API, API_BASE_URL } from '../config';

export default function GovtDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/images/complaints`);
      setComplaints(res.data);
    } catch (e) {
      Alert.alert('Error loading complaints');
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/images/complaints/${id}?status=${status}`);
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } catch (e) {
      Alert.alert('Failed to update');
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:'#f0f4f8' }}>
      <Text style={styles.header}>🏛️ Government Dashboard</Text>
      <Text style={styles.count}>{complaints.length} real potholes reported</Text>
      {loading
        ? <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={complaints}
            keyExtractor={item => String(item.id)}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
            contentContainerStyle={{ padding:16, gap:16 }}
            ListEmptyComponent={<Text style={styles.empty}>No complaints yet!</Text>}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image
                  source={{ uri: `${API_BASE_URL}/static/${(item.annotated_path || item.image_path).split('/').pop()}` }}
                  style={styles.img}
                />
                <View style={styles.info}>
                  <Text style={styles.loc}>📍 {item.latitude?.toFixed(5)}, {item.longitude?.toFixed(5)}</Text>
                  <Text style={styles.desc}>{item.description || 'No description'}</Text>
                  <Text style={styles.conf}>🤖 AI Confidence: {(item.confidence * 100).toFixed(1)}%</Text>
                  <Text style={styles.date}>🕐 {new Date(item.created_at).toLocaleString()}</Text>

                  <View style={[styles.statusBadge,
                    item.status === 'resolved' ? styles.resolved :
                    item.status === 'reviewed' ? styles.reviewed : styles.pending]}>
                    <Text style={styles.statusTxt}>{item.status.toUpperCase()}</Text>
                  </View>

                  <View style={styles.actions}>
                    <TouchableOpacity style={[styles.actionBtn, styles.blueBtn]}
                      onPress={() => updateStatus(item.id, 'reviewed')}>
                      <Text style={styles.actionTxt}>Mark Reviewed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.greenBtn]}
                      onPress={() => updateStatus(item.id, 'resolved')}>
                      <Text style={styles.actionTxt}>Mark Resolved</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        )
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:     { fontSize:22, fontWeight:'bold', color:'#1a1a2e', padding:16, paddingBottom:4 },
  count:      { fontSize:13, color:'#888', paddingHorizontal:16, marginBottom:4 },
  empty:      { textAlign:'center', color:'#888', marginTop:60 },
  card:       { backgroundColor:'#fff', borderRadius:14, overflow:'hidden',
                elevation:3, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6 },
  img:        { width:'100%', height:180 },
  info:       { padding:14, gap:6 },
  loc:        { fontSize:13, color:'#555', fontWeight:'500' },
  desc:       { fontSize:14, color:'#333' },
  conf:       { fontSize:13, color:'#16a34a', fontWeight:'600' },
  date:       { fontSize:12, color:'#aaa' },
  statusBadge:{ alignSelf:'flex-start', paddingHorizontal:12, paddingVertical:4, borderRadius:20, marginTop:4 },
  pending:    { backgroundColor:'#fef3c7' },
  reviewed:   { backgroundColor:'#dbeafe' },
  resolved:   { backgroundColor:'#dcfce7' },
  statusTxt:  { fontSize:11, fontWeight:'700', color:'#333' },
  actions:    { flexDirection:'row', gap:10, marginTop:8 },
  actionBtn:  { flex:1, padding:10, borderRadius:10, alignItems:'center' },
  blueBtn:    { backgroundColor:'#2563eb' },
  greenBtn:   { backgroundColor:'#16a34a' },
  actionTxt:  { color:'#fff', fontWeight:'600', fontSize:13 },
});