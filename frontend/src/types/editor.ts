import type { PasteData } from "./pastes";

export type EditorEngine = "monaco" | "native";
export type MarkdownLayoutMode = "split" | "editor" | "preview";
export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface SelectionRange {
	startLineNumber: number;
	startColumn: number;
	endLineNumber: number;
	endColumn: number;
}

export interface CursorPosition {
	lineNumber: number;
	column: number;
}

export interface EditorChange {
	range: {
		startLineNumber: number;
		startColumn: number;
		endLineNumber: number;
		endColumn: number;
	};
	text: string;
}

export type SocketUpdateData = Partial<PasteData> & {
	changes?: EditorChange[];
	isAutosave?: boolean;
	socketId?: string;
};
