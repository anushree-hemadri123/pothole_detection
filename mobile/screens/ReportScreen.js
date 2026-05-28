import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import axios from 'axios';
import { API } from '../config';

export default function ReportScreen({ route }) {
  const { user_id } = route.params || { user_id: 1 };

  const [photo, setPhoto]           = useState(null);
  const [location, setLocation]     = useState(null);
  const [description, setDesc]      = useState('');
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') {
      return Alert.alert('Permission needed', 'Allow camera access in settings');
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: false });
    if (!res.canceled) {
      setPhoto(res.assets[0]);
      setResult(null);
    }
  };

  const pickFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!res.canceled) {
      setPhoto(res.assets[0]);
      setResult(null);
    }
  };

  const getLocation = async () => {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') {
      return Alert.alert('Permission needed', 'Allow location access in settings');
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setLocation(loc.coords);
    Alert.alert('✅ Location captured!');
  };

  const submit = async () => {
    if (!photo)    return Alert.alert('Add a photo first!');
    if (!location) return Alert.alert('Capture location first!');
    setLoading(true);
    setResult(null);

    const form = new FormData();
form.append('photo', {
  uri: photo.uri,
  name: 'pothole.jpg',
  type: 'image/jpeg',
});
    form.append('latitude', location.latitude);
    form.append('longitude', location.longitude);
    form.append('description', description);
    form.append('user_id',user_id);

    try {
        console.log("CALLING URL:", `${API}/images/analyze`);
        const res = await axios.post(`${API}/images/analyze`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      setResult(res.data);
    } catch (e) {
      console.log("FULL ERROR:", e);
      if (e.code === 'ECONNABORTED') {
        Alert.alert("Timeout", "Request took too long. Please try again.");
      } else if (!e.response) {
        Alert.alert("Network Error", "Backend unreachable or no internet. Check your connection.");
      } else {
        Alert.alert("Error", "Invalid image or server error.");
      }
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>📍 Report a Pothole</Text>

        {/* Photo buttons */}
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.blue]} onPress={takePhoto}>
            <Text style={styles.btnTxt}>📷 Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.gray]} onPress={pickFromGallery}>
            <Text style={styles.btnTxt}>🖼️ Gallery</Text>
          </TouchableOpacity>
        </View>

        {photo && (
          <Image source={{ uri: photo.uri }} style={styles.preview} />
        )}

        {/* Location */}
        <TouchableOpacity 
        style={[styles.btn, styles.green, {marginBottom:4}]}
        onPress={() => {
        console.log("LOCATION BUTTON CLICKED");
        getLocation();
        }}>
          <Text style={styles.btnTxt}>📍 Get My Location</Text>
        </TouchableOpacity>
        {location && (
          <Text style={styles.locText}>
            ✅ {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
          </Text>
        )}

        {/* Description */}
        <TextInput
          style={styles.input}
          placeholder="Describe the pothole (size, depth, danger level...)"
          value={description}
          onChangeText={setDesc}
          multiline
          numberOfLines={3}
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.btn, styles.submit, loading && { opacity: 0.6 }]}
          onPress={submit}
          disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnTxt}>🚀 Submit & Analyze with AI</Text>}
        </TouchableOpacity>

        {/* AI Result */}
        {/* AI Result */}
{result && (
  <View
    style={[
      styles.resultCard,
      !result.is_fake ? styles.realCard : styles.fakeCard
    ]}
  >

    <Text style={styles.resultTitle}>
      {!result.is_fake
        ? 'Pothole Detected'
        : 'No Pothole Detected'}
    </Text>

    <Text style={styles.resultSub}>
      Confidence: {result.confidence}%
    </Text>

  </View>
)}

    </ScrollView>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container:      { padding:20, gap:12 },
  heading:        { fontSize:22, fontWeight:'bold', color:'#1a1a2e', marginBottom:4 },
  row:            { flexDirection:'row', gap:10 },
  btn:            { flex:1, padding:14, borderRadius:12, alignItems:'center' },
  btnTxt:         { color:'#fff', fontWeight:'600', fontSize:15 },
  blue:           { backgroundColor:'#2563eb' },
  green:          { backgroundColor:'#16a34a' },
  gray:           { backgroundColor:'#64748b' },
  submit:         { backgroundColor:'#7c3aed', flex:0 },
  preview:        { width:'100%', height:220, borderRadius:12 },
  locText:        { color:'#16a34a', fontWeight:'500', fontSize:13 },
  input:          { borderWidth:1, borderColor:'#ddd', borderRadius:12,
                    padding:14, minHeight:90, fontSize:14, backgroundColor:'#fff' },
  resultCard:     { borderRadius:14, padding:16, gap:8, marginTop:8 },
  realCard:       { backgroundColor:'#f0fdf4', borderWidth:1.5, borderColor:'#16a34a' },
  fakeCard:       { backgroundColor:'#fef2f2', borderWidth:1.5, borderColor:'#dc2626' },
  resultTitle:    { fontSize:18, fontWeight:'bold' },
  resultSub:      { fontSize:14, color:'#555' },
});