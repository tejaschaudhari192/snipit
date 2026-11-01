export interface AuthCredentials {
	email: string;
	password: string;
}

export interface AuthTokens {
	accessToken?: string;
	refreshToken?: string;
}

export interface UserProfile {
	id: string;
	email: string;
	username: string;
	avatar?: string;
}
