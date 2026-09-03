import { createAsyncThunk } from "@reduxjs/toolkit";
import { updateVault } from "@/tools/password-manager/api/password-manager";
import { keyStore } from "@/tools/password-manager/store/key-store";
import {
	getRecoveryRecord,
	setRecoveryRecord,
	setKeyRecord,
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
} from "@/tools/password-manager/utils/crypto";
import type { PasswordManagerState } from "@/tools/password-manager/types";

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
			return recoveredPassword;
		} catch {
			return rejectWithValue("Invalid recovery key");
		}
	},
);

export const resetMasterPassword = createAsyncThunk(
	"passwordManager/resetMasterPassword",
	async (newPassword: string, { getState, rejectWithValue }) => {
		const state = (getState() as { passwordManager: PasswordManagerState })
			.passwordManager;
		if (!state.userId) return rejectWithValue("No user ID");

		const personalKey = keyStore.getPersonalKey();
		const privateKey = keyStore.getPrivateKey();
		if (!personalKey || !privateKey)
			return rejectWithValue("Vault not unlocked");

		try {
			// 1. Derive new MEK
			const saltStr = crypto.randomUUID();
			const newMek = await deriveMEK(newPassword, saltStr);

			// 2. Re-encrypt keys with new MEK
			const encryptedPersonalKey = encryptWithMEK(
				encodeBase64(personalKey),
				newMek,
			);
			const encryptedPrivateKey = encryptWithMEK(privateKey, newMek);

			// 3. Update backend
			await updateVault({
				encryptedPersonalKey,
				encryptedBlob: encryptedPersonalKey,
				encryptedPrivateKey,
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

			return true;
		} catch (error) {
			return rejectWithValue((error as Error).message);
		}
	},
);
