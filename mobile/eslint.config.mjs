import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{
		ignores: [
			"**/.expo/**",
			"**/dist/**",
			"**/android/**",
			"**/ios/**",
			"**/node_modules/**",
			"src/components/ui/**",
		],
	},
	{
		files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		plugins: {
			js,
			"react-hooks": pluginReactHooks,
		},
		extends: ["js/recommended"],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				__DEV__: "readonly",
			},
			parserOptions: {
				ecmaFeatures: { jsx: true },
			},
		},
		settings: {
			react: {
				version: "detect",
			},
		},
	},
	...tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	pluginReact.configs.flat["jsx-runtime"],
	{
		rules: {
			"react/display-name": "off",
			"react/prop-types": "off",
			"react/no-unescaped-entities": "off",
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-require-imports": "off",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					vars: "all",
					args: "after-used",
					ignoreRestSiblings: true,
					varsIgnorePattern: "^React$",
				},
			],
			"no-empty": "off",
			"no-extra-boolean-cast": "off",
			"react-hooks/exhaustive-deps": "warn",
		},
	},
]);
