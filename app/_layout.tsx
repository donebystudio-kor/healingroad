import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="detail"
          options={{
            headerShown: true,
            headerTitle: '',
            headerBackTitle: '뒤로',
            headerStyle: { backgroundColor: '#F7FAF9' },
            headerShadowVisible: false,
            headerTintColor: '#2D7D6F',
          }}
        />
      </Stack>
    </>
  );
}
