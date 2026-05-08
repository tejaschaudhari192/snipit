import { useEffect, useState, useRef } from "react";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type { Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import type { ActiveUser } from "@/types";

// Infer types from Excalidraw component props for robustness
type ExcalidrawProps = React.ComponentProps<typeof Excalidraw>;
type ExcalidrawAPI = Parameters<
	NonNullable<ExcalidrawProps["excalidrawAPI"]>
>[0];
type ExcalidrawElement =
	ExcalidrawAPI["getSceneElements"] extends () => readonly (infer T)[]
		? T
		: never;
type AppState = ExcalidrawAPI["getAppState"] extends () => infer T ? T : never;
type BinaryFiles = ExcalidrawAPI["getFiles"] extends () => infer T ? T : never;
type Collaborator =
	NonNullable<AppState["collaborators"]> extends Map<SocketId, infer T>
		? T
		: never;
type SocketId = string & { _brand: "SocketId" };

interface DrawData {
	elements: readonly ExcalidrawElement[];
	appState?: Partial<AppState>;
	files?: BinaryFiles;
}

interface CollabDrawProps {
	id?: string;
	socketRef?: React.MutableRefObject<Socket | null>;
	isEdit: boolean;
	content?: string;
	onContentChange?: (val: string) => void;
	theme?: "light" | "dark" | "system";
	activeUsers?: ActiveUser[];
}

interface DrawUpdateData {
	socketId: string;
	elements?: readonly ExcalidrawElement[];
	appState?: Partial<AppState>;
	pointer?: { x: number; y: number; tool: "pointer" | "laser" };
	button?: "up" | "down";
	username?: string;
	color?: { background: string; stroke: string };
	selectedElementIds?: AppState["selectedElementIds"];
	files?: BinaryFiles;
}

export const CollabDraw = ({
	id,
	socketRef,
	isEdit,
	content,
	onContentChange,
	theme,
	activeUsers = [],
}: CollabDrawProps) => {
	const { user } = useAuth();
	const { t, i18n } = useTranslation();
	const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawAPI | null>(
		null,
	);
	const [initialData, setInitialData] = useState<DrawData | null>(null);
	const isRemoteUpdate = useRef(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const emitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lastElementsRef = useRef<string>("");
	const lastAppStateRef = useRef<{
		theme?: string;
		viewBackgroundColor?: string;
		scrollX?: number;
		scrollY?: number;
	}>({});
	const initializedRef = useRef(false);

	useEffect(() => {
		if (content) {
			try {
				const parsed = JSON.parse(content);
				const data: DrawData = {
					elements: parsed?.elements || [],
					appState: parsed?.appState || {},
					files: parsed?.files || undefined,
				};

				if (!initialData) {
					setInitialData(data);
					lastElementsRef.current = JSON.stringify(data.elements);
				} else if (excalidrawAPI) {
					const currentElementsJson = JSON.stringify(data.elements);
					const elementsChanged =
						currentElementsJson !== lastElementsRef.current;
					const appStateChanged =
						data.appState?.theme !==
							lastAppStateRef.current.theme ||
						data.appState?.viewBackgroundColor !==
							lastAppStateRef.current.viewBackgroundColor ||
						data.appState?.scrollX !==
							lastAppStateRef.current.scrollX ||
						data.appState?.scrollY !==
							lastAppStateRef.current.scrollY;

					// Force sync if not yet initialized OR if content actually changed
					if (
						elementsChanged ||
						appStateChanged ||
						!initializedRef.current
					) {
						isRemoteUpdate.current = true;
						excalidrawAPI.updateScene({
							elements: data.elements,
							appState: data.appState as Parameters<
								ExcalidrawAPI["updateScene"]
							>[0]["appState"],
						});
						if (elementsChanged && data.elements.length > 0) {
							excalidrawAPI.scrollToContent(data.elements, {
								fitToViewport: true,
							});
						}
						if (data.files) {
							excalidrawAPI.addFiles(Object.values(data.files));
						}
						lastElementsRef.current = currentElementsJson;
						if (data.appState) {
							lastAppStateRef.current = {
								theme: data.appState.theme,
								viewBackgroundColor:
									data.appState.viewBackgroundColor,
								scrollX: data.appState.scrollX,
								scrollY: data.appState.scrollY,
							};
						}
						initializedRef.current = true;
						setTimeout(() => {
							isRemoteUpdate.current = false;
						}, 100);
					}
				}
			} catch (e) {
				console.error("Failed to parse draw content", e);
				if (!initialData)
					setInitialData({ elements: [] as ExcalidrawElement[] });
			}
		} else if (!content && !initialData) {
			setInitialData({ elements: [] as ExcalidrawElement[] });
		}
	}, [content, initialData, excalidrawAPI]);

	useEffect(() => {
		const socket = socketRef?.current;
		if (!socket || !excalidrawAPI) return;

		const handler = (data: DrawUpdateData) => {
			if (data.socketId === socket.id) return;

			// Merge incoming remote changes into local store
			if (data.elements || data.appState) {
				isRemoteUpdate.current = true;

				const currentElements = excalidrawAPI.getSceneElements();
				const mergedElements = [...currentElements];

				if (data.elements) {
					// Merge strategy: update existing or add new
					data.elements.forEach((newEl) => {
						const index = mergedElements.findIndex(
							(el) => el.id === newEl.id,
						);
						if (index !== -1) {
							// Only update if remote version is newer
							if (newEl.version > mergedElements[index].version) {
								mergedElements[index] = newEl;
							}
						} else {
							mergedElements.push(newEl);
						}
					});
				}

				lastElementsRef.current = JSON.stringify(mergedElements);
				if (data.appState) {
					lastAppStateRef.current = {
						theme: data.appState.theme,
						viewBackgroundColor: data.appState.viewBackgroundColor,
					};
				}

				excalidrawAPI.updateScene({
					elements: mergedElements,
					appState: data.appState as Parameters<
						ExcalidrawAPI["updateScene"]
					>[0]["appState"],
				});
				if (data.files) {
					excalidrawAPI.addFiles(Object.values(data.files));
				}

				// Small delay to ensure all synchronous onChange events are ignored
				setTimeout(() => {
					isRemoteUpdate.current = false;
				}, 100);
			}

			if (data.pointer) {
				const appState = excalidrawAPI.getAppState();
				const currentCollaborators = new Map<SocketId, Collaborator>(
					(appState.collaborators as Map<SocketId, Collaborator>) ||
						[],
				);

				// Try to get name from activeUsers list if provided, otherwise use data.username
				const roomUser = activeUsers.find(
					(u) => u.socketId === data.socketId,
				);
				const displayName =
					data.username ||
					roomUser?.name ||
					t("common.anonymus", "Anonymous");
				const displayColor =
					roomUser?.color || data.color?.background || "#ff0000";

				currentCollaborators.set(
					data.socketId as SocketId,
					{
						pointer: data.pointer, // pointer is already in scene coordinates
						button: data.button || "up",
						username: displayName,
						name: displayName,
						selectedElementIds: data.selectedElementIds || {},
						id: data.socketId,
						color: {
							background: displayColor,
							stroke: displayColor,
						},
					} as Collaborator,
				);

				excalidrawAPI.updateScene({
					appState: {
						...appState,
						collaborators: currentCollaborators,
					},
				});
			}
		};

		socket.on("draw-update", handler);

		return () => {
			socket.off("draw-update", handler);
		};
	}, [socketRef, excalidrawAPI, activeUsers, t]);

	// Sync Excalidraw's collaborators list with our activeUsers prop to handle join/leave correctly
	useEffect(() => {
		if (!excalidrawAPI || !activeUsers) return;

		const appState = excalidrawAPI.getAppState();
		const currentCollaborators = new Map<SocketId, Collaborator>(
			(appState.collaborators as Map<SocketId, Collaborator>) || [],
		);

		const activeSocketIds = new Set(activeUsers.map((u) => u.socketId));
		let changed = false;

		for (const socketId of Array.from(currentCollaborators.keys())) {
			if (!activeSocketIds.has(socketId)) {
				currentCollaborators.delete(socketId);
				changed = true;
			}
		}

		activeUsers.forEach((user) => {
			if (user.socketId === socketRef?.current?.id) return;

			if (!currentCollaborators.has(user.socketId as SocketId)) {
				currentCollaborators.set(
					user.socketId as SocketId,
					{
						username: user.name,
						color: {
							background: user.color || "#ff0000",
							stroke: user.color || "#ff0000",
						},
					} as Collaborator,
				);
				changed = true;
			} else {
				// Update name/color if it changed
				const existing = currentCollaborators.get(
					user.socketId as SocketId,
				);
				if (
					existing &&
					(existing.username !== user.name ||
						existing.color?.background !== user.color)
				) {
					currentCollaborators.set(
						user.socketId as SocketId,
						{
							...existing,
							username: user.name,
							color: {
								background: user.color || "#ff0000",
								stroke: user.color || "#ff0000",
							},
						} as Collaborator,
					);
					changed = true;
				}
			}
		});

		if (changed) {
			excalidrawAPI.updateScene({
				collaborators: currentCollaborators,
			});
		}
	}, [activeUsers, excalidrawAPI, socketRef]);

	const handlePointerUpdate = (payload: {
		pointer: { x: number; y: number; tool: "pointer" | "laser" };
		button: "down" | "up";
	}) => {
		if (!isEdit || !socketRef?.current || !id || !excalidrawAPI) return;

		const ourSelf = activeUsers.find(
			(u) => u.socketId === socketRef.current?.id,
		);
		const myName =
			user?.username ||
			ourSelf?.name ||
			t("common.anonymus", "Anonymous");

		// payload.pointer natively contains scene coordinates from Excalidraw
		socketRef.current.emit("draw-update", {
			pasteId: id,
			pointer: payload.pointer,
			button: payload.button,
			username: myName,
			selectedElementIds: excalidrawAPI.getAppState().selectedElementIds,
		});
	};

	const handleChange = (
		elements: readonly ExcalidrawElement[],
		currentAppState: AppState,
	) => {
		// Only broadcast and save local changes
		if (isRemoteUpdate.current || !isEdit) {
			return;
		}

		// Check what actually changed
		const currentElementsJson = JSON.stringify(elements);
		const elementsChanged = currentElementsJson !== lastElementsRef.current;
		const appStateChanged =
			currentAppState.theme !== lastAppStateRef.current.theme ||
			currentAppState.viewBackgroundColor !==
				lastAppStateRef.current.viewBackgroundColor;

		if (!elementsChanged && !appStateChanged) {
			return;
		}

		// Proceed with tracking changes
		lastElementsRef.current = currentElementsJson;
		lastAppStateRef.current = {
			theme: currentAppState.theme,
			viewBackgroundColor: currentAppState.viewBackgroundColor,
		};

		if (socketRef?.current && id) {
			// Debounce socket updates slightly to avoid network congestion
			if (emitTimeoutRef.current) clearTimeout(emitTimeoutRef.current);
			emitTimeoutRef.current = setTimeout(() => {
				socketRef.current?.emit("draw-update", {
					pasteId: id,
					elements,
					appState: {
						theme: currentAppState.theme,
						viewBackgroundColor:
							currentAppState.viewBackgroundColor,
					},
				});
			}, 30);
		}

		if (onContentChange) {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
			timeoutRef.current = setTimeout(() => {
				onContentChange(
					JSON.stringify({
						elements,
						appState: {
							theme: currentAppState.theme,
							viewBackgroundColor:
								currentAppState.viewBackgroundColor,
						},
					}),
				);
			}, 100);
		}
	};

	if (!initialData)
		return (
			<div className="w-full h-full animate-pulse bg-muted/20 rounded-xl" />
		);

	return (
		<div className="w-full h-full relative touch-none">
			<div className="absolute inset-0 rounded-2xl overflow-hidden shadow-sm touch-none">
				<ErrorBoundary>
					<Excalidraw
						excalidrawAPI={(api) => setExcalidrawAPI(api)}
						initialData={initialData}
						onChange={handleChange}
						onPointerUpdate={handlePointerUpdate}
						viewModeEnabled={!isEdit}
						theme={theme === "dark" ? "dark" : "light"}
						langCode={
							i18n.language.startsWith("hi")
								? "hi-IN"
								: i18n.language.startsWith("mr")
									? "mr-IN"
									: i18n.language.startsWith("ja")
										? "ja-JP"
										: i18n.language.startsWith("de")
											? "de-DE"
											: i18n.language
						}
						UIOptions={{
							canvasActions: {
								loadScene: false,
								export: false,
								saveAsImage: true,
							},
						}}
					/>
				</ErrorBoundary>
			</div>
		</div>
	);
};
