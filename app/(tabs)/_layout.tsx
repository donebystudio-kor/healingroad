import { Tabs } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: '추천' }} />
      <Tabs.Screen name="explore" options={{ title: '탐색' }} />
      <Tabs.Screen name="nearby" options={{ title: '주변' }} />
      <Tabs.Screen name="favorites" options={{ href: null }} />
    </Tabs>
  );
}
