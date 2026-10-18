import './global.css';
import { registerRootComponent } from 'expo';
import nacl from 'tweetnacl';
import * as Crypto from 'expo-crypto';

// Initialize TweetNaCl secure PRNG for native Android and iOS environments
nacl.setPRNG((x, n) => {
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
