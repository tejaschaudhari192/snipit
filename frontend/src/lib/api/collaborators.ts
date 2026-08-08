import api from "../api";
import type { ShareRole } from "@/types";

export const addCollaborator = async (
	pasteId: string,
	email: string,
	role: ShareRole,
): Promise<{ email: string; role: ShareRole; userId?: string }> => {
	const response = await api.post(`/collaborators/${pasteId}`, {
		email,
		role,
	});
	return response.data;
};

export const removeCollaborator = async (
	pasteId: string,
	email: string,
): Promise<{ success: boolean; email: string }> => {
	const response = await api.delete(`/collaborators/${pasteId}`, {
		data: { email },
	});
	return response.data;
};
