import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet,
  ActivityIndicator, SafeAreaView, RefreshControl } from 'react-native';
import axios from 'axios';
import { API, API_BASE_URL } from '../config';

const STATUS_COLOR = {
  pending:  '#f59e0b',
  reviewed: '#3b82f6',
  resolved: '#16a34a',
};

export default function MyComplaintsScreen({ route }) {
  const { user_id } = route.params || {};
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);

  const load = async () => {
    try {
      const res = await axios.get(`${API}/images/complaints`);
      setComplaints(res.data.filter(c => c.user_id === user_id));
    } catch (e) {
      console.log(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <FlatList
        data={complaints}
        keyExtractor={item => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No complaints yet. Report a pothole!</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: `${API_BASE_URL}/static/${item.image_path.split('/').pop()}` }}
              style={styles.img} />
            <View style={styles.info}>
              <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] || '#888' }]}>
                <Text style={styles.badgeTxt}>{item.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.loc}>📍 {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}</Text>
              <Text style={styles.desc}>{item.description || 'No description'}</Text>
              <Text style={styles.conf}>AI confidence: {(item.confidence * 100).toFixed(1)}%</Text>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center:    { flex:1, justifyContent:'center', alignItems:'center' },
  empty:     { textAlign:'center', color:'#888', marginTop:60, fontSize:15 },
  card:      { backgroundColor:'#fff', borderRadius:14, overflow:'hidden',
               elevation:2, shadowColor:'#000', shadowOpacity:0.07, shadowRadius:4 },
  img:       { width:'100%', height:160 },
  info:      { padding:14, gap:6 },
  badge:     { alignSelf:'flex-start', paddingHorizontal:10, paddingVertical:4, borderRadius:20 },
  badgeTxt:  { color:'#fff', fontSize:11, fontWeight:'700' },
  loc:       { fontSize:13, color:'#555' },
  desc:      { fontSize:14, color:'#333' },
  conf:      { fontSize:12, color:'#16a34a', fontWeight:'500' },
  date:      { fontSize:11, color:'#aaa' },
});