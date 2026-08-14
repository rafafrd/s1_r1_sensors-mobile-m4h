import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types/navigation';

import LoginScreen from './src/screens/Login';
import HomeScreen from './src/screens/Home';
import PosicaoGpsScreen from './src/screens/PosicaoGPS';
import LanternaScreen from './src/screens/Lanterna';
import RedesWifiScreen from './src/screens/RedesWifi';
import AcelerometroScreen from './src/screens/acelerometro';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PosicaoGpsScreen" component={PosicaoGpsScreen} options={{ title: 'Posição Atual do GPS' }} />
        <Stack.Screen name="LanternaScreen" component={LanternaScreen} options={{ title: 'Lanterna' }} />
        <Stack.Screen name="RedesWifiScreen" component={RedesWifiScreen} options={{ title: 'Informações de Rede' }} />
        <Stack.Screen name="AcelerometroScreen" component={AcelerometroScreen} options={{ title: 'Acelerômetro' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}