import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { VeepooSDKProvider } from '@gaozh1024/expo-veepoo-sdk';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <VeepooSDKProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </VeepooSDKProvider>
    </SafeAreaProvider>
  );
}
