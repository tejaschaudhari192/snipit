import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{
		ignores: [
			"dist/**/*",
			".vercel/**/*",
			"src/components/ui/**/*",
			".agent/**/*",
		],
	},
	{
		files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		plugins: {
			js,
			"react-hooks": pluginReactHooks,
			"react-refresh": pluginReactRefresh,
		},
		extends: ["js/recommended"],
		languageOptions: { globals: globals.browser },
	},
	tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	pluginReact.configs.flat["jsx-runtime"],
	{
		rules: {
			"react/display-name": "off",
			"react/prop-types": "off",
			"react/no-unescaped-entities": "off",
			"@typescript-eslint/ban-ts-comment": "off",
			"no-extra-boolean-cast": "off",
			"react-hooks/exhaustive-deps": "warn",
			"react-refresh/only-export-components": [
				"warn",
				{ allowConstantExport: true },
			],
		},
	},
]);
