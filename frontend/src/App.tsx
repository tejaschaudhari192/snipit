import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SplashPage from "@/pages/splash";
import Header from "@/components/header/header";
import ThemeProvider from "@/lib/theme";
import { AuthProvider } from "@/context/AuthContext";
import { PasteProvider } from "@/context/PasteContext";
import { SnippetProvider } from "@/context/SnippetContext";
import Loader from "@/components/common/core/loader";
import { loader } from "@monaco-editor/react";
import { useTranslation } from "react-i18next";
import type { HealthData } from "@/types";
import { CONFIG } from "@/configurations";

const HomePage = lazy(() => import("@/pages/home"));
const DisplayPage = lazy(() => import("@/pages/display"));
const HistoryPage = lazy(() => import("@/pages/history"));
const AboutPage = lazy(() => import("@/pages/about"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const LoginPage = lazy(() => import("@/pages/login"));
const SignupPage = lazy(() => import("@/pages/signup"));
const ForgotPasswordPage = lazy(() => import("@/pages/forgot-password"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password"));
const ServerErrorPage = lazy(() => import("@/pages/server-error"));

const App = () => {
	const { i18n } = useTranslation();
	const hasRun = useRef(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [healthData, setHealthData] = useState<HealthData | null>(null);
	const [error, setError] = useState<boolean>(false);

	useEffect(() => {
		const localeMap: Record<string, string> = {
			ja: "ja",
			de: "de",
		};

		const monacoLocale = localeMap[i18n.language] || "en";

		loader.config({
			"vs/nls": {
				availableLanguages: {
					"*": monacoLocale,
				},
			},
		});
	}, [i18n.language]);

	useEffect(() => {
		if (hasRun.current) return;
		hasRun.current = true;

		const checkHealthStream = () => {
			const eventSource = new EventSource(
				`${CONFIG.API_BASE_URL}/health/stream`,
				{ withCredentials: true },
			);

			const currentHealth: HealthData = {
				status: "alive",
				services: {},
				progress: 0,
				currentLabel: "Initializing...",
			};

			eventSource.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					currentHealth.services[data.step] = {
						status: data.status,
						message: data.message || "",
					};
					currentHealth.progress = data.progress;
					currentHealth.currentLabel = data.label;

					if (data.status === "error") {
						currentHealth.status = "down";
						setError(true);
						setLoading(false);
						eventSource.close();
					}

					setHealthData({ ...currentHealth });

					if (data.progress === 100) {
						eventSource.close();
						setTimeout(() => {
							setLoading(false);
						}, 1000);
					}
				} catch (err) {
					console.error("Failed to parse health stream data", err);
				}
			};

			eventSource.onerror = (e) => {
				console.error("Health stream error:", e);
				setError(true);
				setHealthData((prev) => ({
					status: "down",
					services: prev?.services || {},
				}));
				eventSource.close();
				// If it fails immediately, we want to show the error page
				setLoading(false);
			};
		};

		checkHealthStream();
	}, []);

	if (loading) {
		return (
			<ThemeProvider>
				<SplashPage healthData={healthData} />
			</ThemeProvider>
		);
	}

	if (error) {
		return (
			<ThemeProvider>
				<Router>
					<ServerErrorPage
						services={healthData?.services}
						error="Initialization failed during health checks."
					/>
				</Router>
			</ThemeProvider>
		);
	}

	return (
		<ThemeProvider>
			<AuthProvider>
				<SnippetProvider>
					<PasteProvider>
						<Router>
							<div className="h-screen w-full m-0 p-0 box-border flex flex-col overflow-hidden">
								<Header />
								<main className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden relative custom-scrollbar">
									<Suspense
										fallback={
											<div className="flex-1 flex items-center justify-center">
												<Loader />
											</div>
										}
									>
										<Routes>
											<Route
												path="/"
												element={<HomePage />}
											/>
											<Route
												path="/login"
												element={<LoginPage />}
											/>
											<Route
												path="/signup"
												element={<SignupPage />}
											/>
											<Route
												path="/forgot-password"
												element={<ForgotPasswordPage />}
											/>
											<Route
												path="/reset-password/:token"
												element={<ResetPasswordPage />}
											/>
											<Route
												path="/profile"
												element={<ProfilePage />}
											/>
											<Route
												path="/:id"
												element={<DisplayPage />}
											/>
											<Route
												path="/about"
												element={<AboutPage />}
											/>
											<Route
												path="/history"
												element={<HistoryPage />}
											/>
										</Routes>
									</Suspense>
								</main>
							</div>
						</Router>
					</PasteProvider>
				</SnippetProvider>
			</AuthProvider>
		</ThemeProvider>
	);
};

export default App;
