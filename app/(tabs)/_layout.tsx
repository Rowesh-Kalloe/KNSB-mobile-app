import { Tabs } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { View } from 'react-native';
import { Trophy, Award } from 'lucide-react-native';

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  
  // Get current tab index
  const getCurrentTabIndex = () => {
    const currentTab = segments[segments.length - 1];
    if (currentTab === 'standings') return 1;
    return 0; // default to index (Ranglijsten)
  };
  
  // Handle swipe gestures
  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      const { velocityX, translationX } = event;
      const currentIndex = getCurrentTabIndex();
      
      // Swipe left (go to next tab)
      if ((velocityX < -500 || translationX < -100) && currentIndex === 0) {
        router.push('/(tabs)/standings');
      }
      // Swipe right (go to previous tab)
      else if ((velocityX > 500 || translationX > 100) && currentIndex === 1) {
        router.push('/(tabs)/');
      }
    });

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#EA580C',
            tabBarInactiveTintColor: '#666',
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#e0e0e0',
              height: 75,
              paddingBottom: 10,
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
      </View>
    </GestureDetector>
  );
}