import type {
	RecoveryRecord,
	KeyRecord,
} from "@/tools/password-manager/types";

const DB_NAME = "SnipitPasswordManagerDB";
const RECOVERY_STORE = "recovery_records";
const KEYS_STORE = "key_records";
const DB_VERSION = 4; // Bumped version

function getDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);

		request.onsuccess = () => resolve(request.result);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			if (!db.objectStoreNames.contains(RECOVERY_STORE)) {
				db.createObjectStore(RECOVERY_STORE, { keyPath: "userId" });
			}
			if (!db.objectStoreNames.contains(KEYS_STORE)) {
				db.createObjectStore(KEYS_STORE, { keyPath: "userId" });
			}
		};
	});
}

// ─── Key records store ──────────────────────────────────────────────────────

export async function getKeyRecord(
	userId: string,
): Promise<KeyRecord | null> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(KEYS_STORE, "readonly");
		const store = transaction.objectStore(KEYS_STORE);
		const request = store.get(userId);

		request.onsuccess = () => resolve(request.result || null);
		request.onerror = () => reject(request.error);
	});
}

export async function setKeyRecord(record: KeyRecord): Promise<void> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(KEYS_STORE, "readwrite");
		const store = transaction.objectStore(KEYS_STORE);
		const request = store.put(record);

		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

export async function removeKeyRecord(userId: string): Promise<void> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(KEYS_STORE, "readwrite");
		const store = transaction.objectStore(KEYS_STORE);
		const request = store.delete(userId);

		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

// ─── Recovery records store ─────────────────────────────────────────────────

export async function getRecoveryRecord(
	userId: string,
): Promise<RecoveryRecord | null> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(RECOVERY_STORE, "readonly");
		const store = transaction.objectStore(RECOVERY_STORE);
		const request = store.get(userId);

		request.onsuccess = () => resolve(request.result || null);
		request.onerror = () => reject(request.error);
	});
}

export async function setRecoveryRecord(record: RecoveryRecord): Promise<void> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(RECOVERY_STORE, "readwrite");
		const store = transaction.objectStore(RECOVERY_STORE);
		const request = store.put(record);

		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

export async function removeRecoveryRecord(userId: string): Promise<void> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(RECOVERY_STORE, "readwrite");
		const store = transaction.objectStore(RECOVERY_STORE);
		const request = store.delete(userId);

		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}
