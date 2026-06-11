import { useState, useRef, useEffect } from "react";
import { type Socket } from "socket.io-client";

export interface FloatingEmoji {
	id: number;
	emoji: string;
	left: number;
	name: string;
}

export function useFloatingReactions(
	socket: Socket | null | undefined,
	pasteId: string | undefined,
	username: string | undefined,
) {
	const [reactions, setReactions] = useState<FloatingEmoji[]>([]);
	const nextReactionId = useRef(0);

	useEffect(() => {
		if (!socket) return;

		const handleReactionReceived = (data: {
			emoji: string;
			name: string;
		}) => {
			setReactions((prev) => [
				...prev,
				{
					id: nextReactionId.current++,
					emoji: data.emoji,
					left: Math.random() * 80 + 10, // random percentage offset
					name: data.name,
				},
			]);
		};

		socket.on("video-reaction-received", handleReactionReceived);

		return () => {
			socket.off("video-reaction-received", handleReactionReceived);
		};
	}, [socket]);

	const handleSendReaction = (emoji: string) => {
		if (socket && pasteId) {
			socket.emit("video-reaction-send", { pasteId, emoji });
		}
		// Optimistic update
		setReactions((prev) => [
			...prev,
			{
				id: nextReactionId.current++,
				emoji,
				left: Math.random() * 80 + 10,
				name: username || "You",
			},
		]);
	};

	return {
		reactions,
		setReactions,
		handleSendReaction,
	};
}
