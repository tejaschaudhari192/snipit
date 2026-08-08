import api from "../api";
import type { CommentData } from "@/types";

export const addComment = async (
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

export const editComment = async (
	id: string,
	commentId: string,
	content: string,
): Promise<CommentData> => {
	const response = await api.put(`/comments/${id}/${commentId}`, {
		content,
	});
	return response.data;
};

export const deleteComment = async (
	id: string,
	commentId: string,
): Promise<{ success: boolean }> => {
	const response = await api.delete(`/comments/${id}/${commentId}`);
	return response.data;
};
