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

export const detectLanguage = async (
	content: string,
): Promise<{ language: string }> => {
	const response = await api.post("/ai/detect-language", { content });
	return response.data;
};

export const detectSpeechLanguage = async (
	content: string,
): Promise<{ language: string }> => {
	const response = await api.post("/ai/detect-speech-language", { content });
	return response.data;
};

export const enhanceContent = async (
	content: string,
	instruction: string,
): Promise<{ result: string }> => {
	const response = await api.post("/ai/enhance", { content, instruction });
	return response.data;
};

export const getAutocomplete = async (
	language: string,
	prefix: string,
	suffix: string,
	signal?: AbortSignal,
): Promise<{ completion: string }> => {
	const response = await api.post(
		"/ai/autocomplete",
		{
			language,
			prefix: prefix.slice(-1200),
			suffix: suffix.slice(0, 400),
		},
		{ signal },
	);
	return response.data;
};

export const generateDrawContent = async (
	description: string,
): Promise<{ elements: string }> => {
	const response = await api.post("/ai/draw", { description });
	return response.data;
};

export const transcribeAudio = async (
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

export const prepareSpeech = async (
	content: string,
	contentType: string,
): Promise<{ text: string }> => {
	const response = await api.post("/ai/prepare-speech", {
		content,
		contentType,
	});
	return response.data;
};

export const getSpeechAudio = async (
	text: string,
): Promise<{ blob: Blob; voice: string }> => {
	const response = await api.post(
		"/ai/tts",
		{ text },
		{ responseType: "blob" },
	);
	const voice = response.headers["x-selected-voice"] || "af_heart";
	return { blob: response.data, voice };
};
