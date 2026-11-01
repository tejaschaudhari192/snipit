import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export async function setSecureValue(
	key: string,
	value: string,
): Promise<void> {
	await SecureStore.setItemAsync(key, value);
}

export async function getSecureValue(key: string): Promise<string | null> {
	return SecureStore.getItemAsync(key);
}

export async function removeSecureValue(key: string): Promise<void> {
	await SecureStore.deleteItemAsync(key);
}

export const appStorage = {
	getItem: AsyncStorage.getItem,
	setItem: AsyncStorage.setItem,
	removeItem: AsyncStorage.removeItem,
	multiRemove: AsyncStorage.multiRemove,
};
