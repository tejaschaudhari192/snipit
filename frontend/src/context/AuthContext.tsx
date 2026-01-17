import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

export interface User {
	_id: string;
	username: string;
	email: string;
	createdAt?: string;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	login: (userData: User) => void;
	logout: () => Promise<void>;
	checkAuth: () => Promise<void>;
	setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const checkAuth = React.useCallback(async () => {
		try {
			const response = await api.get("/auth/me");
			setUser(response.data);
		} catch {
			setUser(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	const login = React.useCallback((userData: User) => {
		setUser(userData);
	}, []);

	const logout = React.useCallback(async () => {
		try {
			await api.post("/auth/logout");
			setUser(null);
		} catch (error) {
			console.error("Logout failed", error);
		}
	}, []);

	const value = React.useMemo(
		() => ({ user, loading, login, logout, checkAuth, setUser }),
		[user, loading, login, logout, checkAuth],
	);

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
