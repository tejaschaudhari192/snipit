import path from "path";

export interface LanguageCommandConfig {
	cmd: string;
	args: string[];
	fileExt: string;
	compileAndRun?: (fileName: string, exeName: string, code: string) => { cmd: string; args: string[] };
	resolveFileName?: (tempId: string, ext: string, code: string) => string;
}

export const getLanguageConfig = (
	language: string,
	code: string,
	tempId: string,
): {
	cmd: string;
	args: string[];
	fileName: string;
	fileExt: string;
} | null => {
	const lang = language.toLowerCase();
	const isWindows = process.platform === "win32";
	const exeName = isWindows ? "out.exe" : "./out";

	switch (lang) {
		case "javascript":
			return {
				cmd: "node",
				args: [],
				fileExt: ".js",
				fileName: `${tempId}.js`,
			};
		case "python":
			return {
				cmd: "python",
				args: ["-u"],
				fileExt: ".py",
				fileName: `${tempId}.py`,
			};
		case "typescript":
			return {
				cmd: "tsx",
				args: [],
				fileExt: ".ts",
				fileName: `${tempId}.ts`,
			};
		case "php":
			return {
				cmd: "php",
				args: [],
				fileExt: ".php",
				fileName: `${tempId}.php`,
			};
		case "go":
			return {
				cmd: "go",
				args: ["run"],
				fileExt: ".go",
				fileName: `${tempId}.go`,
			};
		case "java": {
			const publicClassMatch = code.match(/public\s+class\s+(\w+)/);
			const mainClassMatch = code.match(/class\s+(\w+)(?:(?!\bclass\b)[\s\S])*?public\s+static\s+void\s+main/);
			const className = publicClassMatch
				? publicClassMatch[1]
				: mainClassMatch
					? mainClassMatch[1]
					: "Main";
			const fileName = `${className}.java`;
			return {
				cmd: `javac ${fileName} && java ${className}`,
				args: [],
				fileExt: ".java",
				fileName,
			};
		}
		case "c": {
			const fileName = `${tempId}.c`;
			return {
				cmd: `gcc ${fileName} -o ${exeName} && ${exeName}`,
				args: [],
				fileExt: ".c",
				fileName,
			};
		}
		case "cpp": {
			const fileName = `${tempId}.cpp`;
			return {
				cmd: `g++ ${fileName} -o ${exeName} && ${exeName}`,
				args: [],
				fileExt: ".cpp",
				fileName,
			};
		}
		case "rust": {
			const fileName = `${tempId}.rs`;
			return {
				cmd: `rustc ${fileName} -o ${exeName} && ${exeName}`,
				args: [],
				fileExt: ".rs",
				fileName,
			};
		}
		case "csharp": {
			return {
				cmd: "dotnet-script",
				args: [],
				fileExt: ".cs",
				fileName: "Program.cs",
			};
		}
		case "shell":
		case "bash": {
			const fileExt = isWindows ? ".bat" : ".sh";
			const cmd = isWindows ? "cmd" : "bash";
			const args = isWindows ? ["/c"] : [];
			return {
				cmd,
				args,
				fileExt,
				fileName: `${tempId}${fileExt}`,
			};
		}
		default:
			return null;
	}
};
