import { useCallback, useRef } from "react";
import type {
	PasteData,
	SocketUpdateData,
	SelectionRange,
	ActiveUser,
	EditorChange,
} from "@/types";
import type { editor } from "monaco-editor";
import { type Socket } from "socket.io-client";
import { CONFIG } from "@/configurations";

interface UseEditorSyncProps {
	id: string | undefined;
	isEdit: boolean;
	socketRef: React.MutableRefObject<Socket | null>;
	applyPulse: (range: SelectionRange, color: string) => void;
	setUpdatedContent: (content: string) => void;
	updateAllFromData: (data: Partial<PasteData>) => void;
	setPaste: React.Dispatch<React.SetStateAction<PasteData | undefined>>;
	setIsAutosave: (val: boolean) => void;
}

export const useEditorSync = ({
	id,
	isEdit,
	socketRef,
	applyPulse,
	setUpdatedContent,
	updateAllFromData,
	setPaste,
	setIsAutosave,
}: UseEditorSyncProps) => {
	const lastLocalEditRef = useRef<number>(0);
	const isRemoteUpdateRef = useRef(false);

	const onRemoteUpdate = useCallback(
		(
			data: SocketUpdateData,
			editorInstance: editor.ICodeEditor | null,
			activeUsers: ActiveUser[],
		) => {
			const timeSinceLastLocalEdit =
				Date.now() - lastLocalEditRef.current;

			const shouldSkipContent =
				(data.content !== undefined || data.changes !== undefined) &&
				timeSinceLastLocalEdit < CONFIG.ui.syncQuarantineMs;

			isRemoteUpdateRef.current = true;
			let contentUpdated = false;

			if (!shouldSkipContent) {
				if (data.changes && data.changes.length > 0 && editorInstance) {
					const model = editorInstance.getModel();
					if (model) {
						model.pushEditOperations(
							[],
							data.changes.map((change: EditorChange) => ({
								range: change.range,
								text: change.text,
								forceMoveMarkers: true,
							})),
							() => null,
						);

						if (data.content !== undefined) {
							const currentVal = model.getValue();
							if (currentVal !== data.content) {
								model.setValue(data.content);
							}
						}
					}

					const usr = activeUsers.find(
						(u) => u.socketId === data.socketId,
					);
					if (usr && data.changes[0]) {
						applyPulse(data.changes[0].range, usr.color);
					}

					setUpdatedContent(editorInstance.getValue());
					contentUpdated = true;
				}

				if (!contentUpdated && data.content !== undefined) {
					if (editorInstance) {
						const model = editorInstance.getModel();
						if (model && model.getValue() !== data.content) {
							model.setValue(data.content);
						}
					}
					setUpdatedContent(data.content);
				}
			}

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { content: _c, changes: _ch, ...metadata } = data;
			const finalMetadata = shouldSkipContent ? metadata : data;

			updateAllFromData(finalMetadata as Partial<PasteData>);
			if (data.isAutosave !== undefined) setIsAutosave(data.isAutosave);

			setPaste((prev) => {
				if (!prev) return prev;
				const updated = { ...prev, ...finalMetadata };
				if (!shouldSkipContent && data.content !== undefined) {
					updated.content = data.content;
				}
				return updated;
			});

			setTimeout(() => {
				isRemoteUpdateRef.current = false;
			}, 300);
		},
		[
			applyPulse,
			setUpdatedContent,
			updateAllFromData,
			setPaste,
			setIsAutosave,
		],
	);

	const handleEditorChange = useCallback(
		(data: { changes?: EditorChange[]; content?: string }) => {
			if (
				isRemoteUpdateRef.current ||
				!socketRef.current ||
				!id ||
				!isEdit
			)
				return;

			lastLocalEditRef.current = Date.now();

			socketRef.current.emit("edit-paste", {
				pasteId: id,
				...data,
			});
		},
		[id, isEdit, socketRef],
	);

	return {
		onRemoteUpdate,
		handleEditorChange,
		isRemoteUpdateRef,
		lastLocalEditRef,
	};
};
