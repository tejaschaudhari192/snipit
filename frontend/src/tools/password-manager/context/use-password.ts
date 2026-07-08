import { useContext } from "react";
import { PasswordContext } from "./password-context-instance";

export const usePassword = () => {
	const ctx = useContext(PasswordContext);
	if (!ctx) {
		throw new Error("usePassword must be used within a PasswordProvider");
	}
	return ctx;
};
