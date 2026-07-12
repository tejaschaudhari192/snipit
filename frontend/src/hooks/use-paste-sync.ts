import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { CONFIG } from "@/configurations";
import type {
	ActiveUser,
	CursorPosition,
	PasteData,
	User,
	SelectionRange,
	SocketUpdateData,
} from "@/types";
import { setupSocketHandlers } from "@/lib/collaboration/socket-handlers";

interface SyncState {
	content?: string;
	language?: string;
	contentMode?: string;
	visibility?: string;
	allowedUsers?: string[];
	editPermission?: string;
	publicRole?: string;
	allowComments?: boolean;
	expiresTime?: string;
	id?: string;
	isAutosave?: boolean;
}

export const usePasteSync = (
	id: string | undefined,
	paste: PasteData | undefined,
	user: User | null,
	isEdit: boolean,
	loading: boolean,
	onRemoteUpdate: (data: SocketUpdateData) => void,
	externalSocketRef?: React.MutableRefObject<Socket | null>,
) => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
	const [remoteCursors, setRemoteCursors] = useState<
		Record<string, { position: CursorPosition; selection?: SelectionRange }>
	>({});

	const internalSocketRef = useRef<Socket | null>(null);
	const socketRef = externalSocketRef || internalSocketRef;
	const syncStateRef = useRef<SyncState>({});
	const isRemoteUpdate = useRef(false);

	const onRemoteUpdateRef = useRef(onRemoteUpdate);
	const isEditRef = useRef(isEdit);

	useEffect(() => {
		onRemoteUpdateRef.current = onRemoteUpdate;
		isEditRef.current = isEdit;
	}, [onRemoteUpdate, isEdit]);

	const userRef = useRef(user);
	useEffect(() => {
		userRef.current = user;
	}, [user]);

	const userId = user?._id;
	const hasPaste = !!paste;

	useEffect(() => {
		if (loading || !id || !hasPaste) return;

		const socketUrl = CONFIG.apiBaseUrl
			? CONFIG.apiBaseUrl.replace(/\/api(\/v\d+)?\/?$/, "")
			: "";

		const s = io(socketUrl, { withCredentials: true });
		socketRef.current = s;
		setSocket(s);

		const cleanup = setupSocketHandlers({
			socket: s,
			id,
			user: userRef.current,
			isEditRef,
			setActiveUsers,
			setRemoteCursors,
			onRemoteUpdateRef,
			isRemoteUpdate,
			syncStateRef,
		});

		return () => {
			cleanup();
			socketRef.current = null;
		};
	}, [id, loading, userId, hasPaste, socketRef]);

	useEffect(() => {
		if (socket && id) {
			socket.emit("set-editing-status", {
				pasteId: id,
				isEditing: isEdit,
			});
		}
	}, [isEdit, socket, id]);

	return {
		socket,
		socketRef,
		activeUsers,
		remoteCursors,
		setRemoteCursors,
		syncStateRef,
		isRemoteUpdate,
	};
};
