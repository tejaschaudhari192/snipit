import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SplashPage from "@/pages/splash";
import { useApiHelpers } from "./lib/api";
import Header from "@/components/header/header";
import ThemeProvider from "@/lib/theme";
import { AuthProvider } from "@/context/AuthContext";
import { PasteProvider } from "@/context/PasteContext";
import { SnippetProvider } from "@/context/SnippetContext";
import Loader from "@/components/common/core/loader";
import { loader } from "@monaco-editor/react";
import { useTranslation } from "react-i18next";

const HomePage = lazy(() => import("@/pages/home"));
const DisplayPage = lazy(() => import("@/pages/display"));
const HistoryPage = lazy(() => import("@/pages/history"));
const AboutPage = lazy(() => import("@/pages/about"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const LoginPage = lazy(() => import("@/pages/login"));
const SignupPage = lazy(() => import("@/pages/signup"));
const ForgotPasswordPage = lazy(() => import("@/pages/forgot-password"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password"));

const App = () => {
	const { i18n } = useTranslation();
	const apiHelpers = useApiHelpers();
	const hasRun = useRef(false);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		// Map i18next language to Monaco supported locales
		const localeMap: Record<string, string> = {
			ja: "ja",
			de: "de",
			// mr and hi are not officially supported by monaco-editor defaults
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
		async function checkStatus() {
			try {
				await apiHelpers.getServerStatus();
			} finally {
				setLoading(false);
			}
		}
		if (!hasRun.current) {
			checkStatus();
			hasRun.current = true;
		}
	}, [apiHelpers]);

	return (
		<ThemeProvider>
			{loading ? (
				<SplashPage />
			) : (
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
													element={
														<ForgotPasswordPage />
													}
												/>
												<Route
													path="/reset-password/:token"
													element={
														<ResetPasswordPage />
													}
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
			)}
		</ThemeProvider>
	);
};

export default App;
