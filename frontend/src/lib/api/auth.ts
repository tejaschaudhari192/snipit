import api from "../api";

export interface LoginPayload {
	email: string;
	password: string;
}

export interface RegisterPayload extends LoginPayload {
	username: string;
}

export interface GoogleLoginPayload {
	idToken: string;
}

export const getMe = async () => {
	const response = await api.get("/auth/me");
	return response.data;
};

export const logoutUser = async () => {
	const response = await api.post("/auth/logout");
	return response.data;
};

export const loginUser = async (payload: LoginPayload) => {
	const response = await api.post("/auth/login", payload);
	return response.data;
};

export const loginGoogle = async (payload: GoogleLoginPayload) => {
	const response = await api.post("/auth/google", payload);
	return response.data;
};

export const registerUser = async (payload: RegisterPayload) => {
	const response = await api.post("/auth/register", payload);
	return response.data;
};

export const updateMe = async (data: {
	username?: string;
	avatar?: string;
}) => {
	const response = await api.put("/auth/me", data);
	return response.data;
};

export const forgotPassword = async (email: string) => {
	const response = await api.post("/auth/forgotpassword", { email });
	return response.data;
};

export const resetPassword = async (token: string, password: string) => {
	const response = await api.put(`/auth/resetpassword/${token}`, {
		password,
	});
	return response.data;
};

export interface ActiveSession {
	_id: string;
	deviceName: string;
	browser: string;
	os: string;
	deviceType: "desktop" | "mobile" | "tablet";
	ipAddress: string;
	lastActive: string;
	expiresAt: string;
	createdAt: string;
	isCurrent: boolean;
}

export const getActiveSessions = async (): Promise<ActiveSession[]> => {
	const response = await api.get<{ sessions: ActiveSession[] }>(
		"/auth/sessions",
	);
	return response.data.sessions;
};

export const revokeSession = async (
	sessionId: string,
): Promise<{ message: string; isCurrent: boolean }> => {
	const response = await api.delete<{ message: string; isCurrent: boolean }>(
		`/auth/sessions/${sessionId}`,
	);
	return response.data;
};

export const revokeAllOtherSessions = async (): Promise<{
	message: string;
	revokedCount: number;
}> => {
	const response = await api.delete<{
		message: string;
		revokedCount: number;
	}>("/auth/sessions");
	return response.data;
};
