import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/sonner";
import "@/index.css";
import App from "@/App.tsx";
import "./i18n"; // 👈 import here to initialize before anything else

if (typeof document !== "undefined") {
	document.addEventListener("mousedown", (e) => {
		// Absolute position
		document.documentElement.style.setProperty(
			"--click-x",
			`${e.clientX}px`,
		);
		document.documentElement.style.setProperty(
			"--click-y",
			`${e.clientY}px`,
		);
		// Offset from viewport center — used as transform-origin for dialog zoom
		const cx = e.clientX - window.innerWidth / 2;
		const cy = e.clientY - window.innerHeight / 2;
		document.documentElement.style.setProperty("--click-cx", `${cx}px`);
		document.documentElement.style.setProperty("--click-cy", `${cy}px`);
	});
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Toaster />
		<App />
	</StrictMode>,
);
