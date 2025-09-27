import { Tabs } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { View, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS,
  interpolate
} from 'react-native-reanimated';
import { Trophy, Award } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  
  // Animation values
  const translateX = useSharedValue(0);
  const isAnimating = useSharedValue(false);
  
  // Get current tab index
  const getCurrentTabIndex = () => {
    const currentTab = segments[segments.length - 1];
    if (currentTab === 'standings') return 1;
    return 0; // default to index (Ranglijsten)
  };
  
  // Navigate with animation
  const navigateToTab = (targetRoute: string) => {
    const currentIndex = getCurrentTabIndex();
    const targetIndex = targetRoute === '/(tabs)/standings' ? 1 : 0;
    
    if (currentIndex === targetIndex) return;
    
    isAnimating.value = true;
    const direction = targetIndex > currentIndex ? -1 : 1;
    
    translateX.value = withSpring(direction * SCREEN_WIDTH, {
      damping: 20,
      stiffness: 90,
    }, () => {
      runOnJS(() => {
        router.push(targetRoute as any);
        translateX.value = 0;
        isAnimating.value = false;
      })();
    });
  };
  
  // Handle swipe gestures
  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!isAnimating.value) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      const { velocityX, translationX } = event;
      const currentIndex = getCurrentTabIndex();
      
      if (isAnimating.value) return;
      
      // Swipe left (go to next tab)
      if ((velocityX < -800 || translationX < -SCREEN_WIDTH * 0.3) && currentIndex === 0) {
        navigateToTab('/(tabs)/standings');
      }
      // Swipe right (go to previous tab)
      else if ((velocityX > 800 || translationX > SCREEN_WIDTH * 0.3) && currentIndex === 1) {
        navigateToTab('/(tabs)/');
      } else {
        // Snap back to original position
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 90,
        });
      }
    });
  
  // Animated style for the container
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
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
      </Animated.View>
    </GestureDetector>
  );
}