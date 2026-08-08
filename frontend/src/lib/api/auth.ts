import api from "../api";

export interface LoginPayload {
	email: string;
	password?: string;
}

export interface RegisterPayload extends LoginPayload {
	username: string;
}

export interface GoogleLoginPayload {
	idToken: string | undefined;
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

export const updateMe = async (data: { username: string }) => {
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
