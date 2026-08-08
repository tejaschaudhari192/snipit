import api from "../api";
import type { PasteData } from "@/types";

export const getLabels = async (
	pasteId: string,
): Promise<{ labels: string[] }> => {
	const response = await api.get(`/labels/snippet/${pasteId}`);
	return response.data;
};

export const updateLabels = async (
	pasteId: string,
	labels: string[],
): Promise<{ labels: string[] }> => {
	const response = await api.post(`/labels/snippet/${pasteId}`, {
		labels,
	});
	return response.data;
};

export const getAllLabels = async (): Promise<{ labels: string[] }> => {
	const response = await api.get("/labels/all");
	return response.data;
};

export const getSnippetsByLabel = async (
	label: string,
): Promise<{ snippets: PasteData[] }> => {
	const response = await api.get(`/labels/filter/${label}`);
	return response.data;
};

export const getSavedPastes = async (): Promise<{ snippets: PasteData[] }> => {
	const response = await api.get("/labels/saved");
	return response.data;
};

export const savePaste = async (
	pasteId: string,
): Promise<{ saved: boolean }> => {
	const response = await api.post(`/labels/save/${pasteId}`);
	return response.data;
};
