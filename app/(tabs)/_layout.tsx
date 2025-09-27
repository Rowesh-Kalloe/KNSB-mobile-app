import { Tabs } from 'expo-router';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useState, useEffect } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { View, Dimensions } from 'react-native';
import { TouchableOpacity, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS,
  interpolate,
  withTiming
} from 'react-native-reanimated';
import { Trophy, Award } from 'lucide-react-native';
import RankingsScreen from './index';
import StandingsScreen from './standings';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  
  // Animation values
  const translateX = useSharedValue(0);
  const [isGestureActive, setIsGestureActive] = useState(false);
  
  // Get current tab index
  const getCurrentTabIndex = () => {
    if (pathname.includes('standings')) return 1;
    return 0; // default to index (Ranglijsten)
  };
  
  // Update current tab index when route changes
  useEffect(() => {
    const newIndex = getCurrentTabIndex();
    setCurrentTabIndex(newIndex);
    
    // Reset translateX when navigating via tab bar
    if (!isGestureActive) {
      translateX.value = withTiming(-newIndex * SCREEN_WIDTH, {
        duration: 300,
      });
    }
  }, [pathname, isGestureActive]);
  
  // Navigate to tab
  const navigateToTab = (index: number) => {
    if (index === currentTabIndex) return;
    
    const targetRoute = index === 1 ? '/(tabs)/standings' : '/(tabs)/';
    setCurrentTabIndex(index);
    router.push(targetRoute as any);
  };
  
  // Handle swipe gestures
  const swipeGesture = Gesture.Pan()
    .onBegin(() => {
      runOnJS(setIsGestureActive)(true);
    })
    .onUpdate((event) => {
      // Calculate the target position based on current tab and gesture
      const basePosition = -currentTabIndex * SCREEN_WIDTH;
      translateX.value = basePosition + event.translationX;
    })
    .onEnd((event) => {
      const { velocityX, translationX } = event;
      
      let targetIndex = currentTabIndex;
      
      // Determine target based on swipe direction and threshold
      if (velocityX < -500 || translationX < -SCREEN_WIDTH * 0.25) {
        // Swipe left - go to next tab
        targetIndex = Math.min(1, currentTabIndex + 1);
      } else if (velocityX > 500 || translationX > SCREEN_WIDTH * 0.25) {
        // Swipe right - go to previous tab
        targetIndex = Math.max(0, currentTabIndex - 1);
      }
      
      // Animate to target position
      translateX.value = withSpring(-targetIndex * SCREEN_WIDTH, {
        damping: 20,
        stiffness: 90,
      }, () => {
        runOnJS(() => {
          setIsGestureActive(false);
          if (targetIndex !== currentTabIndex) {
            navigateToTab(targetIndex);
          }
        })();
      });
    })
    .onFinalize(() => {
      runOnJS(() => {
        setIsGestureActive(false);
      })();
    });
  
  // Animated style for the sliding container
  const slidingContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });
  
  // Animated styles for individual screens
  const screen1Style = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [0, 1, 0]
    );
    return { opacity };
  });
  
  const screen2Style = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SCREEN_WIDTH * 2, -SCREEN_WIDTH, 0],
      [0, 1, 0]
    );
    return { opacity };
  });
  
  // Initialize translateX based on current tab
  useEffect(() => {
    translateX.value = -currentTabIndex * SCREEN_WIDTH;
  }, []);
  
  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={swipeGesture}>
        <View style={{ flex: 1 }}>
          {/* Sliding container with both screens */}
          <Animated.View 
            style={[
              {
                flex: 1,
                flexDirection: 'row',
                width: SCREEN_WIDTH * 2,
              },
              slidingContainerStyle
            ]}
          >
            {/* Screen 1: Rankings */}
            <Animated.View style={[{ width: SCREEN_WIDTH, flex: 1 }, screen1Style]}>
              <RankingsScreen />
            </Animated.View>
            
            {/* Screen 2: Standings */}
            <Animated.View style={[{ width: SCREEN_WIDTH, flex: 1 }, screen2Style]}>
              <StandingsScreen />
            </Animated.View>
          </Animated.View>
        </View>
      </GestureDetector>
      
      {/* Tab Bar */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        height: 75,
        paddingBottom: 10,
        paddingTop: 8,
      }}>
        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => navigateToTab(0)}
        >
          <Trophy 
            size={24} 
            color={currentTabIndex === 0 ? '#EA580C' : '#666'} 
          />
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: currentTabIndex === 0 ? '#EA580C' : '#666',
            marginTop: 4,
          }}>
            Ranglijsten
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => navigateToTab(1)}
        >
          <Award 
            size={24} 
            color={currentTabIndex === 1 ? '#EA580C' : '#666'} 
          />
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: currentTabIndex === 1 ? '#EA580C' : '#666',
            marginTop: 4,
          }}>
            Punten
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}