// Module-scoped in-memory store for CryptoKeys
// This avoids putting non-serializable objects in the Redux store

class KeyStore {
	private mek: Uint8Array | null = null;
	private personalKey: Uint8Array | null = null;
	private privateKey: string | null = null; // Base64
	private publicKey: string | null = null;  // Base64
	private collectionKeys: Map<string, Uint8Array> = new Map();

	setMEK(key: Uint8Array) {
		this.mek = key;
	}

	getMEK(): Uint8Array | null {
		return this.mek;
	}

	setPersonalKey(key: Uint8Array) {
		this.personalKey = key;
	}

	getPersonalKey(): Uint8Array | null {
		return this.personalKey;
	}

	setPrivateKey(key: string) {
		this.privateKey = key;
	}

	getPrivateKey(): string | null {
		return this.privateKey;
	}

	setPublicKey(key: string) {
		this.publicKey = key;
	}

	getPublicKey(): string | null {
		return this.publicKey;
	}

	setCollectionKey(collectionId: string, key: Uint8Array) {
		this.collectionKeys.set(collectionId, key);
	}

	getCollectionKey(collectionId: string): Uint8Array | null {
		return this.collectionKeys.get(collectionId) || null;
	}

	clear() {
		this.mek = null;
		this.personalKey = null;
		this.privateKey = null;
		this.publicKey = null;
		this.collectionKeys.clear();
	}
}

export const keyStore = new KeyStore();
