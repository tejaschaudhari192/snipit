import api from "../api";
import type {
	PasteData,
	CreatePasteData,
	UpdatePasteData,
	PaginatedResponse,
} from "@/types";

export const submitPaste = async (
	data: CreatePasteData,
): Promise<PasteData> => {
	const response = await api.post("/pastes", data);
	return response.data;
};

export const getPaste = async (id: string): Promise<PasteData | null> => {
	try {
		const response = await api.get("/pastes/" + id);
		return response.data;
	} catch {
		return null;
	}
};

export const deletePaste = async (
	id: string,
): Promise<{ acknowledged: boolean; deletedCount: number }> => {
	const response = await api.delete("/pastes/" + id);
	return response.data;
};

export const updatePaste = async (
	id: string,
	data: UpdatePasteData,
): Promise<PasteData> => {
	const response = await api.put("/pastes/" + id, data);
	return response.data;
};

export const getUserPastes = async (
	page: number = 1,
	limit: number = 10,
): Promise<PaginatedResponse<PasteData>> => {
	const response = await api.get("/pastes/user/pastes", {
		params: { page, limit },
	});
	return response.data;
};

export const checkIdAvailability = async (
	id: string,
): Promise<{ available: boolean }> => {
	const response = await api.get(`/pastes/check/${id}`);
	return response.data;
};

export const generateWordId = async (
	count: number,
	categories: string[],
): Promise<{ id: string }> => {
	const response = await api.get("/pastes/generate-word-id", {
		params: { count, categories: categories.join(",") },
	});
	return response.data;
};

export const getWordCategories = async (): Promise<{
	categories: string[];
}> => {
	const response = await api.get("/pastes/word-categories");
	return response.data;
};

export const verifyPassword = async (
	id: string,
	password: string,
): Promise<PasteData> => {
	const response = await api.post(`/pastes/${id}/verify-password`, {
		password,
	});
	return response.data;
};

export const getUserStats = async (): Promise<{
	totalSnippets: number;
	totalViews: number;
	mostUsedLanguage: string;
}> => {
	const response = await api.get("/pastes/user/stats");
	return response.data;
};
