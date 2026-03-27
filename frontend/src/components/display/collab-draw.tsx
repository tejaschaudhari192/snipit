import { useEffect, useState, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type { Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
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
	pointer?: { x: number; y: number; tool: "pointer" | "laser" };
	button?: "up" | "down";
	username?: string;
	color?: { background: string; stroke: string };
	selectedElementIds?: AppState["selectedElementIds"];
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
	const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawAPI | null>(
		null,
	);
	const [initialData, setInitialData] = useState<DrawData | null>(null);
	const isRemoteUpdate = useRef(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastElementsRef = useRef<string>("");

	useEffect(() => {
		if (content) {
			try {
				const parsed = JSON.parse(content);
				// Ensure appState has required fields or is casted correctly
				const data: DrawData = {
					elements: parsed?.elements || [],
					appState: parsed?.appState || {},
					files: parsed?.files || undefined,
				};

				if (!initialData) {
					setInitialData(data);
					lastElementsRef.current = JSON.stringify(data.elements);
				} else if (excalidrawAPI && !isEdit) {
					// If in view mode, sync scene with remote content changes
					excalidrawAPI.updateScene({
						elements: data.elements,
						appState: data.appState as AppState,
					});
					lastElementsRef.current = JSON.stringify(data.elements);
				}
			} catch (e) {
				console.error("Failed to parse draw content", e);
				if (!initialData)
					setInitialData({ elements: [] as ExcalidrawElement[] });
			}
		} else if (!content && !initialData) {
			setInitialData({ elements: [] as ExcalidrawElement[] });
		}
	}, [content, initialData, excalidrawAPI, isEdit]);

	useEffect(() => {
		const socket = socketRef?.current;
		if (!socket || !excalidrawAPI) return;

		const handler = (data: DrawUpdateData) => {
			if (data.socketId === socket.id) return;

			// Merge incoming remote changes into local store
			if (data.elements) {
				isRemoteUpdate.current = true;
				lastElementsRef.current = JSON.stringify(data.elements);
				excalidrawAPI.updateScene({
					elements: data.elements,
				});
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
					data.username || roomUser?.name || "Anonymous";
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
	}, [socketRef, excalidrawAPI, activeUsers]);

	const handlePointerUpdate = (payload: {
		pointer: { x: number; y: number; tool: "pointer" | "laser" };
		button: "down" | "up";
	}) => {
		if (!isEdit || !socketRef?.current || !id || !excalidrawAPI) return;

		const ourSelf = activeUsers.find(
			(u) => u.socketId === socketRef.current?.id,
		);
		const myName = user?.username || ourSelf?.name || "Anonymous";

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
		if (isRemoteUpdate.current || !isEdit || !socketRef?.current || !id) {
			return;
		}

		// Prevent infinite loops caused by appState (e.g., cursor pointer) updates triggering onChange
		const currentElementsJson = JSON.stringify(elements);
		if (currentElementsJson === lastElementsRef.current) {
			return; // Nothing actually changed in the drawing elements
		}

		// This is a local structural change, proceed with tracking it.
		lastElementsRef.current = currentElementsJson;

		socketRef.current.emit("draw-update", {
			pasteId: id,
			elements,
		});

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
			}, 1000);
		}
	};

	if (!initialData)
		return (
			<div className="w-full h-full animate-pulse bg-muted/20 rounded-xl" />
		);

	return (
		<div
			className="w-full h-full relative touch-none"
			style={{ minHeight: "60vh" }}
		>
			<div className="absolute inset-0 rounded-2xl overflow-hidden shadow-sm touch-none">
				<Excalidraw
					excalidrawAPI={(api) => setExcalidrawAPI(api)}
					initialData={initialData}
					onChange={handleChange}
					onPointerUpdate={handlePointerUpdate}
					viewModeEnabled={!isEdit}
					theme={theme === "dark" ? "dark" : "light"}
					UIOptions={{
						canvasActions: {
							loadScene: false,
							export: false,
							saveAsImage: true,
						},
					}}
				/>
			</div>
		</div>
	);
};
