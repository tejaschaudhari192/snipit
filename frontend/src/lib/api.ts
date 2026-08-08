import axios from "axios";
import { CONFIG } from "@/configurations";
import type { HealthData } from "@/types";

const api = axios.create({
	baseURL: CONFIG.apiBaseUrl,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

export const getServerStatus = async (): Promise<HealthData> => {
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

export default api;
