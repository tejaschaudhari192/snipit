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
				"relative z-20 animate-in duration-300 shrink-0 rounded-2xl mx-2  sm:mx-4 mb-2 glass-card overflow-clip",
				position === "bottom"
					? "h-[30vh] min-h-[180px] max-h-[400px] slide-in-from-bottom-10"
					: "w-[35vw] min-w-[300px] max-w-[600px] h-full slide-in-from-right-10",
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
