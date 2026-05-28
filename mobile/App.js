import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ReportScreen from './screens/ReportScreen';
import MyComplaintsScreen from './screens/MyComplaintsScreen';
import GovtDashboard from './screens/GovtDashboard';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login"         component={LoginScreen}        options={{ title: 'Pothole Reporter' }} />
        <Stack.Screen name="Home"          component={HomeScreen}         options={{ title: 'Home' }} />
        <Stack.Screen name="Report"        component={ReportScreen}       options={{ title: 'Report Pothole' }} />
        <Stack.Screen name="MyComplaints"  component={MyComplaintsScreen} options={{ title: 'My Complaints' }} />
        <Stack.Screen name="GovtDashboard" component={GovtDashboard}      options={{ title: 'Govt Dashboard' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}