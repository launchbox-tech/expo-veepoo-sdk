// The SDK instance type the Harvest engine operates on. The package does not
// export the interface by name, so we derive it from what useVeepooSDK() hands
// back — exact, and guaranteed to match what the hook passes into the engine.
import { useVeepooSDK } from 'expo-veepoo-sdk';

export type HarvestSdk = ReturnType<typeof useVeepooSDK>['sdk'];
