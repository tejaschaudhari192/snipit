import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SplashPage from "@/pages/splash";
import Header from "@/components/header/header";
import ThemeProvider from "@/lib/theme";
import { AuthProvider } from "@/context/AuthContext";
import { PasteProvider } from "@/context/PasteContext";
import { SnippetProvider } from "@/context/SnippetContext";
import Loader from "@/components/common/core/loader";
import { HomeLoading } from "@/components/home/home-loading";
import { loader } from "@monaco-editor/react";
import { useTranslation } from "react-i18next";
import { GoogleOAuthProvider } from "@react-oauth/google";

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

import { useHealthCheck } from "@/hooks/use-health-check";
import { CONFIG } from "./configurations";
import { MusicProvider, useMusic } from "@/context/MusicContext";
import MusicPlayerSkeleton from "@/components/common/music/music-player-skeleton";

const MusicBubble = lazy(
	() => import("@/components/common/music/music-bubble"),
);
const MusicPlayerModal = lazy(
	() => import("@/components/common/music/music-player-modal"),
);

const MusicPlayerWrapper = () => {
	const { isPlayerOpen } = useMusic();
	if (!isPlayerOpen) return null;
	return (
		<Suspense fallback={<MusicPlayerSkeleton />}>
			<MusicPlayerModal />
		</Suspense>
	);
};

const App = () => {
	const { i18n } = useTranslation();
	const { loading, healthData, error } = useHealthCheck();

	useEffect(() => {
		const localeMap: Record<string, string> = {
			ja: "ja",
			de: "de",
		};

		const monacoLocale = localeMap[i18n.language] || "en";

		loader.config({
			paths: {
				vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs",
			},
			"vs/nls": {
				availableLanguages: {
					"*": monacoLocale,
				},
			},
		});
	}, [i18n.language]);

	if (loading) {
		return <SplashPage healthData={healthData} />;
	}

	if (error) {
		return <ServerErrorPage />;
	}

	return (
		<ThemeProvider>
			<GoogleOAuthProvider clientId={CONFIG.googleClientId}>
				<AuthProvider>
					<SnippetProvider>
						<PasteProvider>
							<MusicProvider>
								<Router>
									<div className="h-screen w-full m-0 p-0 box-border flex flex-col overflow-hidden bg-background text-foreground font-sans">
										<Header />
										<main className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden relative custom-scrollbar">
											<Suspense fallback={<Loader />}>
												<Routes>
													<Route
														path="/"
														element={
															<Suspense
																fallback={
																	<HomeLoading />
																}
															>
																<HomePage />
															</Suspense>
														}
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
														path="/reset-password"
														element={
															<ResetPasswordPage />
														}
													/>
													<Route
														path="/profile"
														element={
															<ProfilePage />
														}
													/>
													<Route
														path="/server-error"
														element={
															<ServerErrorPage />
														}
													/>
													<Route
														path="/:id"
														element={
															<DisplayPage />
														}
													/>
													<Route
														path="/about"
														element={<AboutPage />}
													/>
													<Route
														path="/history"
														element={
															<HistoryPage />
														}
													/>
												</Routes>
											</Suspense>
										</main>
									</div>
									<Suspense fallback={null}>
										<MusicBubble />
									</Suspense>
									<MusicPlayerWrapper />
								</Router>
							</MusicProvider>
						</PasteProvider>
					</SnippetProvider>
				</AuthProvider>
			</GoogleOAuthProvider>
		</ThemeProvider>
	);
};

export default App;
