import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";
import { loginGoogle, loginGithub } from "@/lib/api/auth";
import { CONFIG } from "@/configurations";

interface SocialAuthButtonsProps {
	disabled?: boolean;
}

export const SocialAuthButtons = ({
	disabled = false,
}: SocialAuthButtonsProps) => {
	const { login } = useAuth();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const [isGithubLoading, setIsGithubLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

	useEffect(() => {
		const code = searchParams.get("code");
		if (code) {
			handleGithubCallback(code);
		}
	}, [searchParams]);

	const handleGithubCallback = async (code: string) => {
		setIsGithubLoading(true);
		try {
			const data = await loginGithub({ code });
			login(data);
			toast.add({ title: t("auth.login_success"), type: "success" });
			navigate("/");
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>;
			toast.add({
				title:
					axiosError.response?.data?.message ||
					t("auth.github_login_failed"),
				type: "error",
			});
		} finally {
			setIsGithubLoading(false);
		}
	};

	const handleGithubClick = () => {
		if (!CONFIG.githubClientId) {
			toast.add({
				title: "GitHub Client ID is not configured.",
				type: "error",
			});
			return;
		}
		const redirectUri = window.location.origin + "/login";
		const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CONFIG.githubClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
		window.location.href = githubAuthUrl;
	};

	const handleGoogleSuccess = async (
		credentialResponse: CredentialResponse,
	) => {
		if (!credentialResponse.credential) {
			toast.add({
				title: t("auth.login_failed"),
				type: "error",
			});
			return;
		}
		setIsGoogleLoading(true);
		try {
			const data = await loginGoogle({
				idToken: credentialResponse.credential,
			});
			login(data);
			toast.add({ title: t("auth.login_success"), type: "success" });
			navigate("/");
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>;
			toast.add({
				title:
					axiosError.response?.data?.message ||
					t("auth.login_failed"),
				type: "error",
			});
		} finally {
			setIsGoogleLoading(false);
		}
	};

	const handleGoogleError = () => {
		toast.add({ title: t("auth.google_login_failed"), type: "error" });
	};

	const isBusy = disabled || isGithubLoading || isGoogleLoading;

	return (
		<div className="pt-1.5 w-full flex flex-col gap-2.5 items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
			<GoogleLogin
				onSuccess={handleGoogleSuccess}
				onError={handleGoogleError}
				useOneTap
				theme="outline"
				shape="rectangular"
				width="346"
			/>

			<Button
				type="button"
				variant="outline"
				onClick={handleGithubClick}
				disabled={isBusy}
				className="w-full max-w-86.5 h-10 rounded-lg flex items-center justify-center gap-2.5 border border-border/80 bg-background/80 hover:bg-muted font-medium text-sm transition-all"
			>
				<svg
					className="h-4 w-4 fill-current shrink-0"
					viewBox="0 0 24 24"
				>
					<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
				</svg>
				<span>
					{isGithubLoading
						? t("auth.logging_in")
						: t("auth.github_login")}
				</span>
			</Button>
		</div>
	);
};
