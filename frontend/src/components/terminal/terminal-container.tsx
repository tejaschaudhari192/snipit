import { cn } from "@/lib/utils";
import { TerminalPanel } from "@/components/display/terminal-panel";
import type { Socket } from "socket.io-client";

interface TerminalContainerProps {
	isOpen: boolean;
	position: "bottom" | "right";
	onPositionChange: (pos: "bottom" | "right") => void;
	onClose: () => void;
	code: string;
	language: string;
	socket: Socket | null;
	className?: string;
}

export const TerminalContainer = ({
	isOpen,
	position,
	onPositionChange,
	onClose,
	code,
	language,
	socket,
	className,
}: TerminalContainerProps) => {
	if (!isOpen) return null;

	return (
		<div
			className={cn(
				"h-full w-full rounded-2xl glass-card overflow-clip animate-in slide-in-from-bottom-4 duration-300",
				className,
			)}
		>
			<TerminalPanel
				onClose={onClose}
				code={code}
				language={language}
				socket={socket}
				position={position}
				onPositionChange={onPositionChange}
			/>
		</div>
	);
};
