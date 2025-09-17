import { Tabs } from 'expo-router';
import { Trophy, Award } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1E3A8A',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIndicatorStyle: {
          backgroundColor: '#1E3A8A',
          height: 3,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ranglijsten',
          tabBarIcon: ({ size, color }) => (
            <Trophy size={24} color={color} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      />
      <Tabs.Screen
        name="standings"
        options={{
          title: 'Punten',
          tabBarIcon: ({ size, color }) => (
            <Award size={24} color={color} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      />
    </Tabs>
  );
}