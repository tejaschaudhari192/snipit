import Vault from "../models/Vault.js";
import VaultItem from "../models/VaultItem.js";
import Collection from "../models/Collection.js";
import CollectionAccess from "../models/CollectionAccess.js";
import User from "@/models/User.js";

export class VaultService {
	/**
	 * Find vault and key pair for user
	 */
	async getUserVault(userId: string) {
		const vault = await Vault.findOne({ userId });
		const user = await User.findById(userId);

		if (!vault) {
			return null;
		}

		return {
			encryptedPersonalKey: vault.encryptedPersonalKey,
			encryptedSettings: vault.encryptedSettings,
			updatedAt: vault.updatedAt,
			version: vault.version,
			salt: vault.salt,
			publicKey: user?.publicKey,
			encryptedPrivateKey: user?.encryptedPrivateKey,
		};
	}

	/**
	 * Create or update user vault
	 */
	async upsertUserVault(
		userId: string,
		data: {
			encryptedPersonalKey: string;
			encryptedSettings?: string;
			salt?: string;
		},
	) {
		let vault = await Vault.findOne({ userId });

		if (vault) {
			vault.encryptedPersonalKey = data.encryptedPersonalKey;
			if (data.encryptedSettings !== undefined) {
				vault.encryptedSettings = data.encryptedSettings;
			}
			if (data.salt !== undefined) {
				vault.salt = data.salt;
			}
			vault.version += 1;
			await vault.save();
		} else {
			vault = await Vault.create({
				userId,
				encryptedPersonalKey: data.encryptedPersonalKey,
				encryptedSettings: data.encryptedSettings,
				salt: data.salt,
				version: 1,
			});
		}

		return vault;
	}

	/**
	 * Completely reset/delete user's vault & all items
	 */
	async resetUserVault(userId: string) {
		await Vault.deleteOne({ userId });
		await VaultItem.deleteMany({ userId });
		await Collection.deleteMany({ userId });
		await CollectionAccess.deleteMany({ userId });
		await CollectionAccess.deleteMany({ sharedWithUserId: userId });

		await User.findByIdAndUpdate(userId, {
			$unset: {
				publicKey: 1,
				encryptedPrivateKey: 1,
			},
		});
	}
}

export const vaultService = new VaultService();
