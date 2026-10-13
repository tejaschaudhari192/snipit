import path from "path";

export interface LanguageExecutionPlan {
	compileCmd?: string;
	compileArgs?: string[];
	runCmd: string;
	runArgs: string[];
	fileName: string;
	fileExt: string;
}

export const getLanguageConfig = (
	language: string,
	code: string,
	tempId: string,
): LanguageExecutionPlan | null => {
	const lang = language.toLowerCase();
	const isWindows = process.platform === "win32";
	const exeName = isWindows ? "out.exe" : "./out";

	switch (lang) {
		case "javascript":
			return {
				runCmd: "node",
				runArgs: [`${tempId}.js`],
				fileExt: ".js",
				fileName: `${tempId}.js`,
			};
		case "python":
			return {
				runCmd: "python",
				runArgs: ["-u", `${tempId}.py`],
				fileExt: ".py",
				fileName: `${tempId}.py`,
			};
		case "typescript":
			return {
				runCmd: "tsx",
				runArgs: [`${tempId}.ts`],
				fileExt: ".ts",
				fileName: `${tempId}.ts`,
			};
		case "php":
			return {
				runCmd: "php",
				runArgs: [`${tempId}.php`],
				fileExt: ".php",
				fileName: `${tempId}.php`,
			};
		case "go":
			return {
				runCmd: "go",
				runArgs: ["run", `${tempId}.go`],
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
				compileCmd: "javac",
				compileArgs: [fileName],
				runCmd: "java",
				runArgs: [className],
				fileExt: ".java",
				fileName,
			};
		}
		case "c": {
			const fileName = `${tempId}.c`;
			return {
				compileCmd: "gcc",
				compileArgs: [fileName, "-o", exeName],
				runCmd: exeName,
				runArgs: [],
				fileExt: ".c",
				fileName,
			};
		}
		case "cpp": {
			const fileName = `${tempId}.cpp`;
			return {
				compileCmd: "g++",
				compileArgs: [fileName, "-o", exeName],
				runCmd: exeName,
				runArgs: [],
				fileExt: ".cpp",
				fileName,
			};
		}
		case "rust": {
			const fileName = `${tempId}.rs`;
			return {
				compileCmd: "rustc",
				compileArgs: [fileName, "-o", exeName],
				runCmd: exeName,
				runArgs: [],
				fileExt: ".rs",
				fileName,
			};
		}
		case "csharp": {
			return {
				runCmd: "dotnet-script",
				runArgs: ["Program.cs"],
				fileExt: ".cs",
				fileName: "Program.cs",
			};
		}
		case "shell":
		case "bash": {
			const fileExt = isWindows ? ".bat" : ".sh";
			const runCmd = isWindows ? "cmd" : "bash";
			const runArgs = isWindows ? ["/c", `${tempId}${fileExt}`] : [`${tempId}${fileExt}`];
			return {
				runCmd,
				runArgs,
				fileExt,
				fileName: `${tempId}${fileExt}`,
			};
		}
		default:
			return null;
	}
};
