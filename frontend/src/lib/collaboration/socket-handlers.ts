import { Socket } from "socket.io-client";
import type {
	User,
	ActiveUser,
	CursorPosition,
	SelectionRange,
	SocketUpdateData,
} from "@/types";

interface HandlerProps {
	socket: Socket;
	id: string;
	user: User | null;
	isEditRef: React.MutableRefObject<boolean>;
	setActiveUsers: (users: ActiveUser[]) => void;
	setRemoteCursors: React.Dispatch<
		React.SetStateAction<
			Record<
				string,
				{ position: CursorPosition; selection?: SelectionRange }
			>
		>
	>;
	onRemoteUpdateRef: React.MutableRefObject<(data: SocketUpdateData) => void>;
	isRemoteUpdate: React.MutableRefObject<boolean>;
	syncStateRef: React.MutableRefObject<SyncState>;
}

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

export const setupSocketHandlers = ({
	socket,
	id,
	user,
	isEditRef,
	setActiveUsers,
	setRemoteCursors,
	onRemoteUpdateRef,
	isRemoteUpdate,
	syncStateRef,
}: HandlerProps) => {
	socket.on("connect", () => {
		socket.emit("join-paste", {
			pasteId: id,
			userName: user?.username,
		});
		if (isEditRef.current) {
			socket.emit("set-editing-status", {
				pasteId: id,
				isEditing: true,
			});
		}
	});

	socket.on("room-users", (users: ActiveUser[]) => {
		setActiveUsers(users);
		const currentIds = new Set(users.map((u) => u.socketId));
		setRemoteCursors((prev) => {
			const next = { ...prev };
			let changed = false;
			for (const key of Object.keys(next)) {
				if (!currentIds.has(key)) {
					delete next[key];
					changed = true;
				}
			}
			return changed ? next : prev;
		});
	});

	socket.on("paste-updated", (data: SocketUpdateData) => {
		isRemoteUpdate.current = true;
		syncStateRef.current = { ...syncStateRef.current, ...data };
		onRemoteUpdateRef.current(data);
		setTimeout(() => {
			isRemoteUpdate.current = false;
		}, 100);
	});

	socket.on("room-state", (data: { content: string }) => {
		onRemoteUpdateRef.current({ content: data.content });
	});

	socket.on(
		"user-cursor-move",
		(data: {
			socketId: string;
			position: CursorPosition;
			selection?: SelectionRange;
		}) => {
			setRemoteCursors((prev) => ({
				...prev,
				[data.socketId]: {
					position: data.position,
					selection: data.selection,
				},
			}));
		},
	);

	socket.on("connect_error", (err) => {
		console.error("Socket: Connection error", err);
	});

	socket.on("error", (err) => {
		console.error("Socket: Error", err);
	});

	return () => {
		socket.emit("leave-paste", id);
		socket.disconnect();
	};
};
