import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import { API } from '../config';

export default function LoginScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handle = async () => {
    if (!email || !password) return Alert.alert('Fill all fields!');
    setLoading(true);
    try {
      if (isRegister) {
        await axios.post(`${API}/auth/register`, { name, email, password });
        //await axios.post(`${API}/api/auth/register`, { name, email, password });
        Alert.alert('✅ Registered! Now login.');
        setIsRegister(false);
      } else {

        console.log("API:", `${API}/auth/login`);

        const res = await axios.post(`${API}/auth/login`, {
        email,
        password
        });

        console.log("Response:", res.data);

       // const res = await axios.post(`${API}/auth/login`, { email, password });
        const { role, user_id, name: uName } = res.data;
        if (role === 'govt') {
          navigation.replace('GovtDashboard', { user_id });
        } else {
          navigation.replace('Home', { user_id, name: uName });
        }
      }
    } catch (e) {
      console.log("ERROR FULL:", e);
      Alert.alert('Error', JSON.stringify(e.response?.data || e.message));
      }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.logo}>🛣️</Text>
      <Text style={styles.title}>Pothole Reporter</Text>
      <Text style={styles.sub}>{isRegister ? 'Create account' : 'Sign in'}</Text>

      {isRegister && (
        <TextInput style={styles.input} placeholder="Full Name"
          value={name} onChangeText={setName} />
      )}
      <TextInput style={styles.input} placeholder="Email"
        value={email} onChangeText={setEmail}
        keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password"
        value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.btn} onPress={handle} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnTxt}>{isRegister ? 'Register' : 'Login'}</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
        <Text style={styles.toggle}>
          {isRegister ? 'Already have an account? Login' : "No account? Register"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', padding:28, backgroundColor:'#f0f4f8' },
  logo:      { fontSize:64, textAlign:'center', marginBottom:8 },
  title:     { fontSize:28, fontWeight:'bold', textAlign:'center', color:'#1a1a2e', marginBottom:4 },
  sub:       { fontSize:14, textAlign:'center', color:'#888', marginBottom:28 },
  input:     { backgroundColor:'#fff', borderWidth:1, borderColor:'#ddd',
               borderRadius:12, padding:14, marginBottom:14, fontSize:15 },
  btn:       { backgroundColor:'#2563eb', padding:16, borderRadius:12,
               alignItems:'center', marginTop:4 },
  btnTxt:    { color:'#fff', fontWeight:'700', fontSize:16 },
  toggle:    { textAlign:'center', color:'#2563eb', marginTop:20, fontSize:14 },
});