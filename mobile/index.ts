import './global.css';
import { registerRootComponent } from 'expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'react-native-css-interop';
import nacl from 'tweetnacl';
import * as Crypto from 'expo-crypto';

// Initialize native C++ JSI crypto bindings if available
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { install } = require('react-native-quick-crypto');
	if (typeof install === 'function') {
		install();
	}
} catch {
	// Fallback to JS / Expo Go if native module is not yet compiled
}

// Register SafeAreaView with NativeWind / cssInterop
cssInterop(SafeAreaView, { className: 'style' });

// Initialize TweetNaCl secure PRNG for native Android and iOS environments
nacl.setPRNG((x: Uint8Array, n: number) => {
	const random = Crypto.getRandomValues(new Uint8Array(n));
	for (let i = 0; i < n; i++) {
		x[i] = random[i];
	}
});

// Polyfill global crypto.getRandomValues for all modules/dependencies in React Native Android & iOS
if (typeof globalThis.crypto === 'undefined') {
	(globalThis as any).crypto = {};
}
if (typeof globalThis.crypto.getRandomValues !== 'function') {
	(globalThis.crypto as any).getRandomValues = <T extends ArrayBufferView | null>(array: T): T => {
		if (!array) return array;
		const uint8 = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
		const random = Crypto.getRandomValues(new Uint8Array(uint8.length));
		uint8.set(random);
		return array;
	};
}

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
