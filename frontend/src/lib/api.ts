import { useMemo } from "react";
import axios from "axios";
import { CONFIG } from "@/configurations";
import type {
	PasteData,
	User,
	ContentMode,
	Visibility,
	EditPermission,
	PublicRole,
	ShareRole,
	IdType,
} from "@/types";

const api = axios.create({
	baseURL: CONFIG.API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

export const useApiHelpers = () => {
	return useMemo(() => {
		const getServerStatus = async (): Promise<boolean> => {
			try {
				const response = await api.get("/");
				return response.status == 200;
			} catch {
				return false;
			}
		};

		const submitPaste = async (data: {
			content: string;
			expiresTime: string;
			idType?: IdType;
			customId?: string;
			contentMode?: ContentMode;
			fileUrl?: string | null;
			fileName?: string | null;
			fileSize?: number | null;
			fileMimeType?: string | null;
			redirectUrl?: boolean;
			language?: string;
			burnAfterRead?: boolean;
			visibility?: Visibility;
			allowedUsers?: string[];
			password?: string;
			editPermission?: EditPermission;
			shareList?: {
				email: string;
				role: ShareRole;
			}[];
			publicRole?: PublicRole;
			allowComments?: boolean;
		}): Promise<PasteData> => {
			const response = await api.post("/", data);
			return response.data;
		};

		const getPaste = async (id: string): Promise<PasteData | null> => {
			try {
				const response = await api.get("/" + id);
				const data = response.data;
				return data;
			} catch {
				return null;
			}
		};

		const deletePaste = async (
			id: string,
		): Promise<{ acknowledged: boolean; deletedCount: number }> => {
			const response = await api.delete("/" + id);
			const data = response.data;
			return data;
		};

		const updatePaste = async (
			id: string,
			content: string,
			redirectUrl?: boolean,
			language?: string,
			visibility?: Visibility,
			allowedUsers?: string[],
			newId?: string,
			password?: string,
			editPermission?: EditPermission,
			shareList?: {
				email: string;
				role: ShareRole;
			}[],
			publicRole?: PublicRole,
			allowComments?: boolean,
			expiresTime?: string,
			contentMode?: ContentMode,
		): Promise<PasteData> => {
			const response = await api.put("/" + id, {
				content,
				redirectUrl,
				language,
				visibility,
				allowedUsers,
				newId,
				password,
				editPermission,
				shareList,
				publicRole,
				allowComments,
				expiresTime,
				contentMode,
			});
			const data = response.data;
			return data;
		};

		const detectLanguage = async (
			content: string,
		): Promise<{ language: string }> => {
			const response = await api.post("/detect-language", { content });
			return response.data;
		};

		const enhanceContent = async (
			content: string,
			instruction: string,
		): Promise<{ result: string }> => {
			const response = await api.post("/enhance", {
				content,
				instruction,
			});
			return response.data;
		};

		const getUserPastes = async (): Promise<PasteData[]> => {
			const response = await api.get("/user/pastes");
			return response.data;
		};

		const updateMe = async (data: {
			username: string;
		}): Promise<User & { message: string }> => {
			const response = await api.put("/auth/me", data);
			return response.data;
		};

		const verifyPassword = async (
			id: string,
			password: string,
		): Promise<PasteData> => {
			const response = await api.post(`/${id}/verify-password`, {
				password,
			});
			return response.data;
		};

		const addComment = async (
			id: string,
			content: string,
			author?: string,
		): Promise<PasteData> => {
			const response = await api.post(`/${id}/comment`, {
				content,
				author,
			});
			return response.data;
		};

		return {
			getServerStatus,
			submitPaste,
			getPaste,
			deletePaste,
			updatePaste,
			detectLanguage,
			enhanceContent,
			getUserPastes,
			updateMe,
			verifyPassword,
			addComment,
			forgotPassword: async (
				email: string,
			): Promise<{ success: boolean; data: string }> => {
				const response = await api.post("/auth/forgotpassword", {
					email,
				});
				return response.data;
			},
			resetPassword: async (
				token: string,
				password: string,
			): Promise<
				User & { success: boolean; token: string; message?: string }
			> => {
				const response = await api.put(`/auth/resetpassword/${token}`, {
					password,
				});
				return response.data;
			},
		};
	}, []);
};

export default api;
