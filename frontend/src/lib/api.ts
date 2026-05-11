import { useMemo } from "react";
import axios from "axios";
import { CONFIG } from "@/configurations";
import type {
	PasteData,
	User,
	PaginatedResponse,
	CreatePasteData,
	UpdatePasteData,
	HealthData,
	CommentData,
	ShareRole,
} from "@/types";

const api = axios.create({
	baseURL: CONFIG.apiBaseUrl,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

export const useApiHelpers = () => {
	return useMemo(() => {
		const getServerStatus = async (): Promise<HealthData> => {
			try {
				const response = await api.get("/health");
				return response.data;
			} catch (error: unknown) {
				const err = error as {
					response?: { data: HealthData };
					message: string;
				};
				return err.response?.data || { status: "down", services: {} };
			}
		};

		const submitPaste = async (
			data: CreatePasteData,
		): Promise<PasteData> => {
			const response = await api.post("/pastes", data);
			return response.data;
		};

		const getPaste = async (id: string): Promise<PasteData | null> => {
			try {
				const response = await api.get("/pastes/" + id);
				const data = response.data;
				return data;
			} catch {
				return null;
			}
		};

		const deletePaste = async (
			id: string,
		): Promise<{ acknowledged: boolean; deletedCount: number }> => {
			const response = await api.delete("/pastes/" + id);
			const data = response.data;
			return data;
		};

		const updatePaste = async (
			id: string,
			data: UpdatePasteData,
		): Promise<PasteData> => {
			const response = await api.put("/pastes/" + id, data);
			const result = response.data;
			return result;
		};

		const detectLanguage = async (
			content: string,
		): Promise<{ language: string }> => {
			const response = await api.post("/ai/detect-language", { content });
			return response.data;
		};

		const enhanceContent = async (
			content: string,
			instruction: string,
		): Promise<{ result: string }> => {
			const response = await api.post("/ai/enhance", {
				content,
				instruction,
			});
			return response.data;
		};

		const getAutocomplete = async (
			language: string,
			prefix: string,
			suffix: string,
		): Promise<{ completion: string }> => {
			const response = await api.post("/ai/autocomplete", {
				language,
				prefix: prefix.slice(-1500),
				suffix: suffix.slice(0, 500),
			});
			return response.data;
		};

		const generateDrawContent = async (
			description: string,
		): Promise<{ elements: string }> => {
			const response = await api.post("/ai/draw", { description });
			return response.data;
		};

		const transcribeAudio = async (
			audioBlob: Blob,
		): Promise<{ text: string }> => {
			const formData = new FormData();
			formData.append("audio", audioBlob, "recording.webm");
			const response = await api.post("/ai/transcribe", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			return response.data;
		};

		const getUserPastes = async (
			page: number = 1,
			limit: number = 10,
		): Promise<PaginatedResponse<PasteData>> => {
			const response = await api.get("/pastes/user/pastes", {
				params: { page, limit },
			});
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
			const response = await api.post(`/pastes/${id}/verify-password`, {
				password,
			});
			return response.data;
		};

		const addComment = async (
			id: string,
			content: string,
			author?: string,
		): Promise<CommentData> => {
			const response = await api.post(`/comments/${id}`, {
				content,
				author,
			});
			return response.data;
		};

		const getUserStats = async (): Promise<{
			totalSnippets: number;
			totalViews: number;
			mostUsedLanguage: string;
		}> => {
			const response = await api.get("/pastes/user/stats");
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
			getAutocomplete,
			generateDrawContent,
			transcribeAudio,
			getUserPastes,
			getUserStats,
			updateMe,
			verifyPassword,
			addComment,
			getLabels: async (
				pasteId: string,
			): Promise<{ labels: string[] }> => {
				const response = await api.get(`/labels/snippet/${pasteId}`);
				return response.data;
			},
			updateLabels: async (
				pasteId: string,
				labels: string[],
			): Promise<{ labels: string[] }> => {
				const response = await api.post(`/labels/snippet/${pasteId}`, {
					labels,
				});
				return response.data;
			},
			getAllLabels: async (): Promise<{ labels: string[] }> => {
				const response = await api.get("/labels/all");
				return response.data;
			},
			getSnippetsByLabel: async (
				label: string,
			): Promise<{ snippets: PasteData[] }> => {
				const response = await api.get(`/labels/filter/${label}`);
				return response.data;
			},
			getSavedPastes: async (): Promise<{ snippets: PasteData[] }> => {
				const response = await api.get("/labels/saved");
				return response.data;
			},
			savePaste: async (pasteId: string): Promise<{ saved: boolean }> => {
				const response = await api.post(`/labels/save/${pasteId}`);
				return response.data;
			},
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
			addCollaborator: async (
				pasteId: string,
				email: string,
				role: ShareRole,
			): Promise<{ email: string; role: ShareRole; userId?: string }> => {
				const response = await api.post(`/collaborators/${pasteId}`, {
					email,
					role,
				});
				return response.data;
			},
			removeCollaborator: async (
				pasteId: string,
				email: string,
			): Promise<{ success: boolean; email: string }> => {
				const response = await api.delete(`/collaborators/${pasteId}`, {
					data: { email },
				});
				return response.data;
			},
		};
	}, []);
};

export default api;
