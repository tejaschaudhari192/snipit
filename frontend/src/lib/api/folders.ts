import api from "../api";
import type { FolderData, PasteData } from "@/types";

export const createFolder = async (data: {
	name: string;
	parentId?: string | null;
	color?: string | null;
	icon?: string | null;
}): Promise<FolderData> => {
	const response = await api.post("/folders", data);
	return response.data;
};

export const getFoldersTree = async (): Promise<{ folders: FolderData[] }> => {
	const response = await api.get("/folders/tree");
	return response.data;
};

export const getFolderContents = async (
	id: string | "root",
): Promise<{ subfolders: FolderData[]; snippets: PasteData[] }> => {
	const response = await api.get(`/folders/contents/${id}`);
	return response.data;
};

export const updateFolder = async (
	id: string,
	data: { name?: string; color?: string | null; icon?: string | null },
): Promise<FolderData> => {
	const response = await api.patch(`/folders/${id}`, data);
	return response.data;
};

export const moveFolder = async (
	id: string,
	newParentId: string | null,
): Promise<FolderData> => {
	const response = await api.patch(`/folders/${id}/move`, { newParentId });
	return response.data;
};

export const deleteFolder = async (
	id: string,
): Promise<{ success: boolean; deletedCount: number }> => {
	const response = await api.delete(`/folders/${id}`);
	return response.data;
};
