import api from "../api";

export interface SubmitFeedbackPayload {
	type: "bug" | "feature" | "general";
	title: string;
	description: string;
	userEmail?: string;
}

export const submitFeedback = async (payload: SubmitFeedbackPayload) => {
	const response = await api.post("/feedback", payload);
	return response.data;
};
