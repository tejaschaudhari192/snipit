import api from "../api";

export interface SuggestIdPayload {
	content: string;
	files?: Array<{
		name?: string;
		type?: string;
	}>;
}

export const suggestId = async (payload: SuggestIdPayload) => {
	const response = await api.post("/ai/suggest-id", payload);
	return response.data;
};
