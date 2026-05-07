import { useEffect, useRef, useCallback } from "react";
import type { OnMount } from "@monaco-editor/react";
import type { ActiveUser, CursorPosition, SelectionRange } from "@/types";

type MonacoEditor = Parameters<OnMount>[0];

interface IContentWidget {
	getId(): string;
	getDomNode(): HTMLElement;
	getPosition(): {
		position: { lineNumber: number; column: number };
		preference: number[];
	} | null;
}

interface CursorWidget {
	widget: IContentWidget;
	setPosition: (pos: CursorPosition) => void;
}

function createCursorWidget(
	socketId: string,
	user: ActiveUser,
	initialPos: CursorPosition,
): CursorWidget {
	let currentPos: CursorPosition = initialPos;

	const domNode = document.createElement("div");
	domNode.style.pointerEvents = "none";
	domNode.style.zIndex = "100";
	domNode.style.position = "relative";

	const bar = document.createElement("div");
	bar.style.width = "2px";
	bar.style.height = "18px";
	bar.style.background = user.color;
	bar.style.boxShadow = `0 0 6px ${user.color}`;
	bar.style.position = "absolute";
	bar.style.top = "0";
	bar.style.left = "0";

	const tag = document.createElement("div");
	tag.textContent = user.name;
	tag.style.position = "absolute";
	tag.style.bottom = "100%";
	tag.style.left = "0";
	tag.style.background = user.color;
	tag.style.color = "white";
	tag.style.fontSize = "10px";
	tag.style.padding = "1px 6px";
	tag.style.borderRadius = "3px 3px 3px 0";
	tag.style.whiteSpace = "nowrap";
	tag.style.fontWeight = "bold";
	tag.style.fontFamily = "sans-serif";
	tag.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
	tag.style.lineHeight = "14px";

	domNode.appendChild(bar);
	domNode.appendChild(tag);

	const widget: IContentWidget = {
		getId: () => `remote-cursor-${socketId}`,
		getDomNode: () => domNode,
		getPosition: () => ({
			position: {
				lineNumber: currentPos.lineNumber,
				column: currentPos.column,
			},
			preference: [0],
		}),
	};

	return {
		widget,
		setPosition: (pos: CursorPosition) => {
			currentPos = pos;
		},
	};
}

export function useRemoteCursors(
	editor: MonacoEditor | null,
	remoteCursors: Record<
		string,
		{ position: CursorPosition; selection?: SelectionRange }
	>,
	activeUsers: ActiveUser[],
) {
	const widgetMapRef = useRef<Map<string, CursorWidget>>(new Map());
	const decorationsRef = useRef<Map<string, string[]>>(new Map());

	useEffect(() => {
		if (!editor) return;

		const widgetMap = widgetMapRef.current;
		const decorationsMap = decorationsRef.current;
		const activeSocketIds = new Set<string>();

		// Ensure we have a style element for custom colors
		let styleSheet = document.getElementById("remote-cursor-styles");
		if (!styleSheet) {
			styleSheet = document.createElement("style");
			styleSheet.id = "remote-cursor-styles";
			document.head.appendChild(styleSheet);
		}

		for (const [socketId, data] of Object.entries(remoteCursors)) {
			const usr = activeUsers.find((u) => u.socketId === socketId);
			if (!usr || !data.position?.lineNumber) continue;

			activeSocketIds.add(socketId);
			const pos = data.position;
			const selection = data.selection;

			// 1. Handle Cursor Widget
			const existing = widgetMap.get(socketId);
			if (existing) {
				existing.setPosition(pos);
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(editor as any).layoutContentWidget(existing.widget);
			} else {
				const cursor = createCursorWidget(socketId, usr, pos);
				widgetMap.set(socketId, cursor);
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(editor as any).addContentWidget(cursor.widget);
			}

			// 2. Handle Selection Decorations
			if (
				selection &&
				(selection.startLineNumber !== selection.endLineNumber ||
					selection.startColumn !== selection.endColumn)
			) {
				// Create a unique class for this user's selection color if not exists
				const className = `remote-selection-${socketId}`;
				const styleRule = `
					.${className} { 
						background-color: ${usr.color} !important; 
						opacity: 0.2;
						border-left: 2px solid ${usr.color}; 
					}
				`;

				if (!styleSheet.textContent?.includes(className)) {
					styleSheet.textContent += styleRule;
				}

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const newDecorations = (editor as any).deltaDecorations(
					decorationsMap.get(socketId) || [],
					[
						{
							range: selection,
							options: {
								className: className,
								stickiness: 1, // monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
							},
						},
					],
				);
				decorationsMap.set(socketId, newDecorations);
			} else {
				// Clear selection if it's just a cursor position
				if (decorationsMap.has(socketId)) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(editor as any).deltaDecorations(
						decorationsMap.get(socketId)!,
						[],
					);
					decorationsMap.delete(socketId);
				}
			}
		}

		// 3. Cleanup stale widgets and decorations
		for (const [socketId, cursor] of widgetMap.entries()) {
			if (!activeSocketIds.has(socketId)) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(editor as any).removeContentWidget(cursor.widget);
				widgetMap.delete(socketId);

				if (decorationsMap.has(socketId)) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(editor as any).deltaDecorations(
						decorationsMap.get(socketId)!,
						[],
					);
					decorationsMap.delete(socketId);
				}
			}
		}
	}, [editor, remoteCursors, activeUsers]);

	const applyPulse = useCallback(
		(range: SelectionRange, color: string) => {
			if (!editor) return;

			const pulseClass = `remote-pulse-${Math.random().toString(36).slice(2)}`;
			let styleSheet = document.getElementById("remote-cursor-styles");
			if (!styleSheet) {
				styleSheet = document.createElement("style");
				styleSheet.id = "remote-cursor-styles";
				document.head.appendChild(styleSheet);
			}

			const styleRule = `
			@keyframes remotePulseFade {
				0% { background-color: ${color}55; }
				100% { background-color: transparent; }
			}
			.${pulseClass} { 
				animation: remotePulseFade 2s ease-out forwards;
				border-radius: 2px;
			}
		`;
			styleSheet.textContent += styleRule;

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const decorId = (editor as any).deltaDecorations(
				[],
				[
					{
						range: range,
						options: {
							className: pulseClass,
							stickiness: 1,
						},
					},
				],
			);

			setTimeout(() => {
				if (editor) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(editor as any).deltaDecorations(decorId, []);
				}
			}, 2000);
		},
		[editor],
	);

	useEffect(() => {
		const widgetMap = widgetMapRef.current;
		const decorationsMap = decorationsRef.current;

		return () => {
			if (editor) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const ed = editor as any;
				for (const cursor of widgetMap.values()) {
					try {
						ed.removeContentWidget(cursor.widget);
					} catch {
						/* ignore */
					}
				}
				for (const decorIds of decorationsMap.values()) {
					try {
						ed.deltaDecorations(decorIds, []);
					} catch {
						/* ignore */
					}
				}
			}
			widgetMap.clear();
			decorationsMap.clear();
		};
	}, [editor]);

	return { applyPulse };
}
