import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";

export const ALGO_NAME = "tweetnacl";

/**
 * Derive a Master Encryption Key (MEK) from the user's master password.
 * TweetNaCl does not include a KDF like PBKDF2/Argon2, so we still rely on native WebCrypto for derivation.
 */
export async function deriveKeyFromPassword(password: string, saltString: string): Promise<Uint8Array> {
	const enc = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		enc.encode(password),
		{ name: "PBKDF2" },
		false,
		["deriveBits"]
	);

	const salt = enc.encode(saltString);
	const derivedBits = await crypto.subtle.deriveBits(
		{
			name: "PBKDF2",
			salt,
			iterations: 100000,
			hash: "SHA-256",
		},
		keyMaterial,
		256 // 32 bytes for tweetnacl
	);
	
	return new Uint8Array(derivedBits);
}

export const deriveMEK = deriveKeyFromPassword;

/**
 * Generate an asymmetric keypair (Curve25519)
 */
export function generateKeyPair(): { publicKey: string, secretKey: string, privateKey: string } {
	const keypair = nacl.box.keyPair();
	const pub = naclUtil.encodeBase64(keypair.publicKey);
	const sec = naclUtil.encodeBase64(keypair.secretKey);
	return {
		publicKey: pub,
		secretKey: sec,
		privateKey: sec // alias for older code
	};
}

export function getPublicKeyFromPrivateKey(privateKeyBase64: string): string {
	const secretKeyBytes = naclUtil.decodeBase64(privateKeyBase64);
	const keypair = nacl.box.keyPair.fromSecretKey(secretKeyBytes);
	return naclUtil.encodeBase64(keypair.publicKey);
}

export function generateSymmetricKey(): Uint8Array {
	return nacl.randomBytes(nacl.secretbox.keyLength);
}

export function exportKeyRaw(key: Uint8Array): Uint8Array {
	return key; // No-op, already Uint8Array
}

export function importKeyRaw(key: Uint8Array): Uint8Array {
	return key; // No-op
}

export function exportPublicKeyJWK(key: string): string {
	return key;
}

export function exportPrivateKeyJWK(key: string): string {
	return key;
}

export function importPrivateKeyJWK(key: string): string {
	return key;
}

/**
 * Encrypt data symmetrically using MEK (SecretBox)
 */
export function encryptSymmetric(data: unknown, key: Uint8Array): string {
	const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
	const messageUint8 = naclUtil.decodeUTF8(JSON.stringify(data));
	const box = nacl.secretbox(messageUint8, nonce, key);
	
	const fullMessage = new Uint8Array(nonce.length + box.length);
	fullMessage.set(nonce);
	fullMessage.set(box, nonce.length);
	
	return naclUtil.encodeBase64(fullMessage);
}

export const encryptWithMEK = encryptSymmetric;
export const encryptPayload = encryptSymmetric;

/**
 * Decrypt data symmetrically using MEK (SecretBox)
 */
export function decryptSymmetric(encryptedBase64: string, key: Uint8Array): unknown {
	const messageWithNonceAsUint8Array = naclUtil.decodeBase64(encryptedBase64);
	const nonce = messageWithNonceAsUint8Array.slice(0, nacl.secretbox.nonceLength);
	const message = messageWithNonceAsUint8Array.slice(
		nacl.secretbox.nonceLength,
		messageWithNonceAsUint8Array.length
	);
	
	const decrypted = nacl.secretbox.open(message, nonce, key);
	if (!decrypted) {
		throw new Error("Could not decrypt message");
	}
	
	const base64Decoded = naclUtil.encodeUTF8(decrypted);
	return JSON.parse(base64Decoded);
}

export const decryptWithMEK = decryptSymmetric;
export const decryptPayload = decryptSymmetric;

/**
 * Encrypt data asymmetrically for a recipient (Box)
 * Uses an ephemeral keypair for the sender to emulate sealedBox.
 */
export function encryptAsymmetric(data: unknown, theirPublicKeyBase64: string): string {
	const ephemeralKeyPair = nacl.box.keyPair();
	const theirPublicKey = naclUtil.decodeBase64(theirPublicKeyBase64);
	const nonce = nacl.randomBytes(nacl.box.nonceLength);
	const messageUint8 = naclUtil.decodeUTF8(JSON.stringify(data));
	
	const box = nacl.box(messageUint8, nonce, theirPublicKey, ephemeralKeyPair.secretKey);
	
	// Payload format: [ephemeralPublicKey(32)][nonce(24)][box]
	const fullMessage = new Uint8Array(ephemeralKeyPair.publicKey.length + nonce.length + box.length);
	fullMessage.set(ephemeralKeyPair.publicKey);
	fullMessage.set(nonce, ephemeralKeyPair.publicKey.length);
	fullMessage.set(box, ephemeralKeyPair.publicKey.length + nonce.length);
	
	return naclUtil.encodeBase64(fullMessage);
}

/**
 * Decrypt data asymmetrically (Box)
 */
export function decryptAsymmetric(encryptedBase64: string, mySecretKeyBase64: string): unknown {
	const messageWithNonceAsUint8Array = naclUtil.decodeBase64(encryptedBase64);
	const mySecretKey = naclUtil.decodeBase64(mySecretKeyBase64);
	
	const ephemeralPublicKey = messageWithNonceAsUint8Array.slice(0, nacl.box.publicKeyLength);
	const nonce = messageWithNonceAsUint8Array.slice(nacl.box.publicKeyLength, nacl.box.publicKeyLength + nacl.box.nonceLength);
	const message = messageWithNonceAsUint8Array.slice(
		nacl.box.publicKeyLength + nacl.box.nonceLength,
		messageWithNonceAsUint8Array.length
	);
	
	const decrypted = nacl.box.open(message, nonce, ephemeralPublicKey, mySecretKey);
	if (!decrypted) {
		throw new Error("Could not decrypt message");
	}
	
	const base64Decoded = naclUtil.encodeUTF8(decrypted);
	return JSON.parse(base64Decoded);
}

/**
 * Helper to encrypt a raw collection key for a recipient
 */
export function encryptCollectionKeyForUser(rawCollectionKey: Uint8Array, recipientPublicKeyBase64: string): string {
	const ephemeralKeyPair = nacl.box.keyPair();
	const theirPublicKey = naclUtil.decodeBase64(recipientPublicKeyBase64);
	const nonce = nacl.randomBytes(nacl.box.nonceLength);
	
	const box = nacl.box(rawCollectionKey, nonce, theirPublicKey, ephemeralKeyPair.secretKey);
	
	const fullMessage = new Uint8Array(ephemeralKeyPair.publicKey.length + nonce.length + box.length);
	fullMessage.set(ephemeralKeyPair.publicKey);
	fullMessage.set(nonce, ephemeralKeyPair.publicKey.length);
	fullMessage.set(box, ephemeralKeyPair.publicKey.length + nonce.length);
	
	return naclUtil.encodeBase64(fullMessage);
}

/**
 * Helper to decrypt a collection key
 */
export function decryptCollectionKey(encryptedBase64: string, mySecretKeyBase64: string): Uint8Array {
	const messageWithNonceAsUint8Array = naclUtil.decodeBase64(encryptedBase64);
	const mySecretKey = naclUtil.decodeBase64(mySecretKeyBase64);
	
	const ephemeralPublicKey = messageWithNonceAsUint8Array.slice(0, nacl.box.publicKeyLength);
	const nonce = messageWithNonceAsUint8Array.slice(nacl.box.publicKeyLength, nacl.box.publicKeyLength + nacl.box.nonceLength);
	const message = messageWithNonceAsUint8Array.slice(
		nacl.box.publicKeyLength + nacl.box.nonceLength,
		messageWithNonceAsUint8Array.length
	);
	
	const decrypted = nacl.box.open(message, nonce, ephemeralPublicKey, mySecretKey);
	if (!decrypted) {
		throw new Error("Could not decrypt collection key");
	}
	
	return decrypted;
}

/**
 * Helper to run schema migrations on parsed payloads.
 */
const migrations: Record<number, (data: unknown) => unknown> = {};

export function runMigrations(parsedPayload: Record<string, unknown> | null) {
	if (!parsedPayload) return null;
	
	let currentVersion = (parsedPayload.schemaVersion as number) || 1;
	let data: unknown = parsedPayload.data || parsedPayload; // fallback for unversioned

	while (migrations[currentVersion]) {
		data = migrations[currentVersion](data);
		currentVersion++;
	}

	return { schemaVersion: currentVersion, data };
}

export function encodeBase64(arr: Uint8Array): string {
	return naclUtil.encodeBase64(arr);
}

export function decodeBase64(str: string): Uint8Array {
	return naclUtil.decodeBase64(str);
}
