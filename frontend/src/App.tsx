import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SplashPage from "@/pages/splash";
import Header from "@/components/header/header";
import ThemeProvider from "@/lib/theme";
import { AuthProvider } from "@/context/AuthContext";
import { PasteProvider } from "@/context/PasteContext";
import { SnippetProvider } from "@/context/SnippetContext";
import Loader from "@/components/common/core/loader";
import { HomeLoading } from "@/components/home/home-loading";
import { DisplayLoading } from "@/components/display/display-loading";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { TtsProvider } from "@/context";
import { TtsMiniPlayer } from "@/components/common/tts-mini-player";

const HomePage = lazy(() => import("@/pages/home"));
const DisplayPage = lazy(() => import("@/pages/display"));
const HistoryPage = lazy(() => import("@/pages/history"));
const AboutPage = lazy(() => import("@/pages/about"));
const ToolsPage = lazy(() => import("@/pages/tools"));
const CryptoSafePage = lazy(() => import("@/pages/cryptoSafe"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const LoginPage = lazy(() => import("@/pages/login"));
const SignupPage = lazy(() => import("@/pages/signup"));
const ForgotPasswordPage = lazy(() => import("@/pages/forgot-password"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password"));
const ServerErrorPage = lazy(() => import("@/pages/server-error"));

import { useHealthCheck } from "@/hooks/use-health-check";
import { CONFIG } from "./configurations";
import { MusicProvider } from "@/context/MusicContext";
import { useMusic } from "@/context/use-music";
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
	const { loading, healthData, error } = useHealthCheck();

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
								<TtsProvider>
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
															element={
																<LoginPage />
															}
														/>
														<Route
															path="/signup"
															element={
																<SignupPage />
															}
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
																<Suspense
																	fallback={
																		<DisplayLoading />
																	}
																>
																	<DisplayPage />
																</Suspense>
															}
														/>
														<Route
															path="/about"
															element={
																<AboutPage />
															}
														/>
														<Route
															path="/tools"
															element={
																<ToolsPage />
															}
														/>
														<Route
															path="/tools/cryptoSafe"
															element={
																<CryptoSafePage />
															}
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
									<TtsMiniPlayer />
								</TtsProvider>
							</MusicProvider>
						</PasteProvider>
					</SnippetProvider>
				</AuthProvider>
			</GoogleOAuthProvider>
		</ThemeProvider>
	);
};

export default App;
