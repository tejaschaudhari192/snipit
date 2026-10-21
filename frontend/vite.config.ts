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
				manualChunks: {
					tiptap: [
						"@tiptap/core",
						"@tiptap/react",
						"@tiptap/extension-table",
						"@tiptap/extension-table-row",
						"@tiptap/extension-table-header",
						"@tiptap/extension-table-cell",
						"novel",
					],
				},
			},
		},
	},
});
