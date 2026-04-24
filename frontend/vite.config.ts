import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules")) {
						if (id.includes("@monaco-editor") || id.includes("monaco-editor")) {
							return "monaco";
						}
						if (id.includes("@excalidraw")) {
							return "excalidraw";
						}
						if (id.includes("katex") || id.includes("react-markdown") || id.includes("remark") || id.includes("rehype")) {
							return "markdown-katex";
						}
						if (id.includes("jspdf")) {
							return "jspdf";
						}
						if (id.includes("lucide-react") || id.includes("@radix-ui")) {
							return "ui-vendor";
						}
						return "vendor";
					}
				},
			},
		},
		chunkSizeWarningLimit: 1000,
	},
});
