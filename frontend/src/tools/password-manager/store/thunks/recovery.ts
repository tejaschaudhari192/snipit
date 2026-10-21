import { createAsyncThunk } from "@reduxjs/toolkit";
import { getVault, updateVault } from "@/tools/password-manager/api/password-manager";
import { keyStore } from "@/tools/password-manager/store/key-store";
import {
	getRecoveryRecord,
	setRecoveryRecord,
	setKeyRecord,
	getKeyRecord,
} from "@/tools/password-manager/utils/indexed-db";
import {
	generateRecoveryMnemonic,
	encryptMasterPassword,
	decryptMasterPassword,
} from "@/tools/password-manager/utils/recovery";
import {
	deriveMEK,
	encryptWithMEK,
	encodeBase64,
	decryptWithMEK,
	decodeBase64,
	getPublicKeyFromPrivateKey,
} from "@/tools/password-manager/utils/crypto";
import type { PasswordManagerState, ServerVaultData } from "@/tools/password-manager/types";
import { fetchVaultData } from "./vault";
import { fetchSharedCollections } from "./sharing";

export const checkRecoveryKey = createAsyncThunk(
	"passwordManager/checkRecoveryKey",
	async (_, { getState }) => {
		const state = (getState() as { passwordManager: PasswordManagerState })
			.passwordManager;
		if (!state.userId) return false;
		const record = await getRecoveryRecord(state.userId);
		return !!record;
	},
);

export const generateRecoveryKey = createAsyncThunk(
	"passwordManager/generateRecoveryKey",
	async (masterPassword: string, { getState, rejectWithValue }) => {
		const state = (getState() as { passwordManager: PasswordManagerState })
			.passwordManager;
		if (!state.userId) return rejectWithValue("No user ID");

		try {
			const mnemonic = generateRecoveryMnemonic();
			const encryptedRecord = await encryptMasterPassword(
				mnemonic,
				masterPassword,
			);

			await setRecoveryRecord({
				userId: state.userId,
				encryptedMnemonic: encryptedRecord.encrypted,
				salt: encryptedRecord.salt,
				iv: encryptedRecord.iv,
				updatedAt: new Date().toISOString(),
			});

			return mnemonic;
		} catch (error) {
			return rejectWithValue((error as Error).message);
		}
	},
);

export const recoverWithMnemonic = createAsyncThunk(
	"passwordManager/recoverWithMnemonic",
	async (mnemonic: string, { getState, rejectWithValue }) => {
		const state = (getState() as { passwordManager: PasswordManagerState })
			.passwordManager;
		if (!state.userId) return rejectWithValue("No user ID");

		try {
			const record = await getRecoveryRecord(state.userId);
			if (!record) return rejectWithValue("No recovery record found");

			const recoveredPassword = await decryptMasterPassword(mnemonic, {
				encrypted: record.encryptedMnemonic,
				salt: record.salt,
				iv: record.iv,
			});

			// Unlock the vault with the recovered password so keyStore is populated.
			// This is required for resetMasterPassword to re-encrypt the keys.
			const res = await getVault<{ data: ServerVaultData }>();
			if (!res.data) return rejectWithValue("Vault not found on server");

			const vaultData = res.data;

			// Fall back to local keyRecord salt, same as unlockVault does
			const keyRecord = await getKeyRecord(state.userId);
			const saltStr = vaultData.salt || keyRecord?.salt;
			if (!saltStr) return rejectWithValue("Vault salt missing");

			const mek = await deriveMEK(recoveredPassword, saltStr);

			const encryptedPersonalKey =
				vaultData.encryptedPersonalKey || vaultData.encryptedBlob;
			if (!encryptedPersonalKey)
				return rejectWithValue("Vault corrupted: missing personal key");

			const decodedPersonalKeyB64 = decryptWithMEK(
				encryptedPersonalKey,
				mek,
			) as string;
			if (!decodedPersonalKeyB64)
				return rejectWithValue("Invalid recovery key: could not decrypt personal key");
			const personalKey = decodeBase64(decodedPersonalKeyB64);

			if (!vaultData.encryptedPrivateKey)
				return rejectWithValue("Vault corrupted: missing private key");
			const privateKey = decryptWithMEK(
				vaultData.encryptedPrivateKey,
				mek,
			) as string;
			if (!privateKey)
				return rejectWithValue("Invalid recovery key: could not decrypt private key");

			keyStore.setMEK(mek);
			keyStore.setPersonalKey(personalKey);
			keyStore.setPrivateKey(privateKey);
			keyStore.setPublicKey(
				vaultData.publicKey ?? getPublicKeyFromPrivateKey(privateKey),
			);

			return recoveredPassword;
		} catch (error) {
			// Propagate real error message instead of swallowing with a generic message
			return rejectWithValue((error as Error).message ?? "Recovery failed");
		}
	},
);

export const resetMasterPassword = createAsyncThunk(
	"passwordManager/resetMasterPassword",
	async (newPassword: string, { getState, rejectWithValue, dispatch }) => {
		const state = (getState() as { passwordManager: PasswordManagerState })
			.passwordManager;
		if (!state.userId) return rejectWithValue("No user ID");

		const personalKey = keyStore.getPersonalKey();
		const privateKey = keyStore.getPrivateKey();
		const publicKey = keyStore.getPublicKey();
		if (!personalKey || !privateKey)
			return rejectWithValue("Vault not unlocked");

		try {
			// 1. Derive new MEK with a fresh salt
			const saltStr = crypto.randomUUID();
			const newMek = await deriveMEK(newPassword, saltStr);

			// 2. Re-encrypt existing keys with new MEK
			const encryptedPersonalKey = encryptWithMEK(
				encodeBase64(personalKey),
				newMek,
			);
			const encryptedPrivateKey = encryptWithMEK(privateKey, newMek);

			// 3. Update backend — re-send publicKey to keep server in sync
			await updateVault({
				encryptedPersonalKey,
				encryptedBlob: encryptedPersonalKey,
				encryptedPrivateKey,
				publicKey: publicKey ?? undefined,
				salt: saltStr,
			});

			// 4. Update local keyStore and IndexedDB
			keyStore.setMEK(newMek);
			await setKeyRecord({
				userId: state.userId,
				encryptedPersonalKey,
				encryptedPrivateKey,
				salt: saltStr,
				updatedAt: new Date().toISOString(),
			});

			// 5. Now unlocked — load vault data
			await dispatch(fetchSharedCollections());
			dispatch(fetchVaultData());

			return true;
		} catch (error) {
			return rejectWithValue((error as Error).message);
		}
	},
);
