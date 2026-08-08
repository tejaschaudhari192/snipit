import api from "../api";

export const getVault = async <T = unknown>(): Promise<T> => {
	const response = await api.get("/tools/password-manager/vault");
	return response.data;
};

export const updateVault = async <T = unknown>(data: unknown): Promise<T> => {
	const response = await api.put("/tools/password-manager/vault", data);
	return response.data;
};

export const deleteVault = async <T = unknown>(): Promise<T> => {
	const response = await api.delete("/tools/password-manager/vault");
	return response.data;
};

export const getVaultItems = async <T = unknown>(
	vaultId?: string,
): Promise<T> => {
	const query = vaultId ? `?vaultId=${vaultId}` : "";
	const response = await api.get(
		`/tools/password-manager/vault/items${query}`,
	);
	return response.data;
};

export const createVaultItem = async <T = unknown>(
	data: unknown,
): Promise<T> => {
	const response = await api.post(
		"/tools/password-manager/vault/items",
		data,
	);
	return response.data;
};

export const updateVaultItem = async <T = unknown>(
	itemId: string,
	data: unknown,
): Promise<T> => {
	const response = await api.put(
		`/tools/password-manager/vault/items/${itemId}`,
		data,
	);
	return response.data;
};

export const deleteVaultItem = async <T = unknown>(
	itemId: string,
): Promise<T> => {
	const response = await api.delete(
		`/tools/password-manager/vault/items/${itemId}`,
	);
	return response.data;
};

export const getVaultShares = async <T = unknown>(
	vaultId: string,
): Promise<T> => {
	const response = await api.get(
		`/tools/password-manager/vault/share?vaultId=${vaultId}`,
	);
	return response.data;
};

export const shareVaultAccess = async <T = unknown>(
	data: unknown,
): Promise<T> => {
	const response = await api.post(
		"/tools/password-manager/vault/share",
		data,
	);
	return response.data;
};

export const revokeVaultAccess = async <T = unknown>(
	accessId: string,
): Promise<T> => {
	const response = await api.delete(
		`/tools/password-manager/vault/share/${accessId}`,
	);
	return response.data;
};

export const lookupShareUser = async <T = unknown>(
	data: unknown,
): Promise<T> => {
	const response = await api.post(
		"/tools/password-manager/vault/share/lookup",
		data,
	);
	return response.data;
};

export const deleteVaultCollection = async <T = unknown>(
	collectionId: string,
): Promise<T> => {
	const response = await api.delete(
		`/tools/password-manager/vault/collections/${collectionId}`,
	);
	return response.data;
};

export const getVaultCollections = async <T = unknown>(): Promise<T> => {
	const response = await api.get("/tools/password-manager/vault/collections");
	return response.data;
};

export const shareVaultItem = async <T = unknown>(
	data: unknown,
): Promise<T> => {
	const response = await api.post(
		"/tools/password-manager/vault/share/item",
		data,
	);
	return response.data;
};

export const shareVaultFolder = async <T = unknown>(
	data: unknown,
): Promise<T> => {
	const response = await api.post(
		"/tools/password-manager/vault/share/folder",
		data,
	);
	return response.data;
};
