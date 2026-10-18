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

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
