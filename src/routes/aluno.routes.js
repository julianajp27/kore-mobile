import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Vamos criar essas telas no próximo passo!
import Dashboard from '../screens/Dashboard';
import Listagem from '../screens/Listagem';
import Envio from '../screens/Envio';

const Tab = createBottomTabNavigator();

export default function AlunoRoutes() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'home-outline';
          else if (route.name === 'Certificados') iconName = 'list-outline';
          else if (route.name === 'Enviar') iconName = 'cloud-upload-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00B7B8',
        tabBarInactiveTintColor: '#64748b',
        headerStyle: { backgroundColor: '#0f1923' },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Certificados" component={Listagem} />
      <Tab.Screen name="Enviar" component={Envio} />
    </Tab.Navigator>
  );
}