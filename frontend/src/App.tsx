import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/home";
import DisplayPage from "@/pages/display";
import HistoryPage from "@/pages/history";
import AboutPage from "@/pages/about";
import SplashPage from "@/pages/splash";
import { useEffect, useRef, useState } from "react";
import { useApiHelpers } from "./lib/api";
import Header from "@/components/header";
import ThemeProvider from "@/lib/theme";

import { AuthProvider } from "@/context/AuthContext";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";

const App = () => {
	const apiHelpers = useApiHelpers();
	const hasRun = useRef(false);
	const [loading, setLoading] = useState<boolean>(true);
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

	if (loading) return <SplashPage />;

	return (
		<ThemeProvider>
			<AuthProvider>
				<Router>
					<div className="min-h-screen w-full m-0 p-0 box-border flex flex-col">
						<Header />
						<Routes>
							<Route path="/" element={<HomePage />} />
							<Route path="/login" element={<LoginPage />} />
							<Route path="/signup" element={<SignupPage />} />
							<Route path="/:id" element={<DisplayPage />} />
							<Route path="/about" element={<AboutPage />} />
							<Route path="/history" element={<HistoryPage />} />
						</Routes>
					</div>
				</Router>
			</AuthProvider>
		</ThemeProvider>
	);
};

export default App;
