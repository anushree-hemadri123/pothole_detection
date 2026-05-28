import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default function HomeScreen({ navigation, route }) {
  const { user_id, name } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.greeting}>Hello, {name || 'Citizen'} 👋</Text>
      <Text style={styles.sub}>Help fix roads in your city</Text>

      <TouchableOpacity style={[styles.card, {backgroundColor:'#2563eb'}]}
        onPress={() => navigation.navigate('Report', { user_id })}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.cardTitle}>Report a Pothole</Text>
        <Text style={styles.cardDesc}>Take photo — AI checks if real</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, {backgroundColor:'#16a34a'}]}
        onPress={() => navigation.navigate('MyComplaints', { user_id })}>
        <Text style={styles.icon}>📋</Text>
        <Text style={styles.cardTitle}>My Complaints</Text>
        <Text style={styles.cardDesc}>Track your submitted reports</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:24, backgroundColor:'#f0f4f8' },
  greeting:  { fontSize:24, fontWeight:'bold', color:'#1a1a2e', marginBottom:4 },
  sub:       { fontSize:14, color:'#888', marginBottom:28 },
  card:      { borderRadius:16, padding:24, marginBottom:16 },
  icon:      { fontSize:36, marginBottom:8 },
  cardTitle: { fontSize:20, fontWeight:'700', color:'#fff', marginBottom:4 },
  cardDesc:  { fontSize:13, color:'rgba(255,255,255,0.85)' },
});