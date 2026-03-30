import { useEffect, useRef } from "react";
import type { OnMount } from "@monaco-editor/react";
import type { ActiveUser, CursorPosition } from "@/types";

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
	remoteCursors: Record<string, CursorPosition>,
	activeUsers: ActiveUser[],
): void {
	const widgetMapRef = useRef<Map<string, CursorWidget>>(new Map());

	useEffect(() => {
		if (!editor) return;

		const widgetMap = widgetMapRef.current;
		const activeSocketIds = new Set<string>();

		for (const [socketId, pos] of Object.entries(remoteCursors)) {
			const usr = activeUsers.find((u) => u.socketId === socketId);
			if (!usr || !pos?.lineNumber) continue;

			activeSocketIds.add(socketId);

			const existing = widgetMap.get(socketId);
			if (existing) {
				existing.setPosition(pos);
				(
					editor as unknown as {
						layoutContentWidget(w: IContentWidget): void;
					}
				).layoutContentWidget(existing.widget);
			} else {
				const cursor = createCursorWidget(socketId, usr, pos);
				widgetMap.set(socketId, cursor);
				(
					editor as unknown as {
						addContentWidget(w: IContentWidget): void;
					}
				).addContentWidget(cursor.widget);
			}
		}

		for (const [socketId, cursor] of widgetMap.entries()) {
			if (!activeSocketIds.has(socketId)) {
				(
					editor as unknown as {
						removeContentWidget(w: IContentWidget): void;
					}
				).removeContentWidget(cursor.widget);
				widgetMap.delete(socketId);
			}
		}
	}, [editor, remoteCursors, activeUsers]);

	useEffect(() => {
		const widgetMap = widgetMapRef.current;
		return () => {
			if (editor) {
				const ed = editor as unknown as {
					removeContentWidget(w: IContentWidget): void;
				};
				for (const cursor of widgetMap.values()) {
					try {
						ed.removeContentWidget(cursor.widget);
					} catch {
						/* ignore */
					}
				}
			}
			widgetMap.clear();
		};
	}, [editor]);
}
