import type {
	VaultRecord,
	RecoveryRecord,
} from "@/tools/password-manager/types";

const DB_NAME = "SnipitPasswordManagerDB";
const RECORDS_STORE = "vault_records";
const RECOVERY_STORE = "recovery_records";
const DB_VERSION = 3;

function getDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);

		request.onsuccess = () => resolve(request.result);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			if (!db.objectStoreNames.contains(RECORDS_STORE)) {
				db.createObjectStore(RECORDS_STORE, { keyPath: "userId" });
			}

			if (!db.objectStoreNames.contains(RECOVERY_STORE)) {
				db.createObjectStore(RECOVERY_STORE, { keyPath: "userId" });
			}
		};
	});
}

// ─── Per-user vault records store ───────────────────────────────────────────

export async function getVaultRecord(
	userId: string,
): Promise<VaultRecord | null> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(RECORDS_STORE, "readonly");
		const store = transaction.objectStore(RECORDS_STORE);
		const request = store.get(userId);

		request.onsuccess = () => resolve(request.result || null);
		request.onerror = () => reject(request.error);
	});
}

export async function setVaultRecord(record: VaultRecord): Promise<void> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(RECORDS_STORE, "readwrite");
		const store = transaction.objectStore(RECORDS_STORE);
		const request = store.put(record);

		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

export async function getAllVaultRecords(): Promise<VaultRecord[]> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(RECORDS_STORE, "readonly");
		const store = transaction.objectStore(RECORDS_STORE);
		const request = store.getAll();

		request.onsuccess = () => resolve(request.result || []);
		request.onerror = () => reject(request.error);
	});
}

export async function removeVaultRecord(userId: string): Promise<void> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(RECORDS_STORE, "readwrite");
		const store = transaction.objectStore(RECORDS_STORE);
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
