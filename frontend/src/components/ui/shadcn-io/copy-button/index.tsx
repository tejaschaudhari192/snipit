"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { cn } from "@/utils";
import { buttonVariants, type ButtonVariants } from "./variants";

type CopyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
	ButtonVariants & {
		content?: string;
		delay?: number;
		onCopy?: (content: string) => void;
		isCopied?: boolean;
		onCopyChange?: (isCopied: boolean) => void;
		children?: React.ReactNode;
	};

export function CopyButton({
	content,
	className,
	size,
	variant,
	delay = 3000,
	onClick,
	onCopy,
	isCopied,
	onCopyChange,
	children,
	...props
}: CopyButtonProps) {
	const [localIsCopied, setLocalIsCopied] = React.useState(isCopied ?? false);

	React.useEffect(() => {
		setLocalIsCopied(isCopied ?? false);
	}, [isCopied]);

	const handleIsCopied = React.useCallback(
		(isCopied: boolean) => {
			setLocalIsCopied(isCopied);
			onCopyChange?.(isCopied);
		},
		[onCopyChange],
	);

	const handleCopy = React.useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			if (localIsCopied) return;
			if (content) {
				navigator.clipboard
					.writeText(content)
					.then(() => {
						handleIsCopied(true);
						setTimeout(() => handleIsCopied(false), delay);
						onCopy?.(content);
					})
					.catch(console.error);
			}
			onClick?.(e);
		},
		[localIsCopied, content, delay, onClick, onCopy, handleIsCopied],
	);

	return (
		<button
			className={cn(
				buttonVariants({ variant, size }),
				"gap-2 transition-all active:scale-95 group",
				className,
			)}
			onClick={handleCopy}
			{...props}
		>
			<div className="relative w-4 h-4 flex items-center justify-center">
				<CheckIcon
					className={cn(
						"absolute transition-all duration-200",
						localIsCopied
							? "scale-100 opacity-100"
							: "scale-0 opacity-0",
					)}
				/>
				<CopyIcon
					className={cn(
						"absolute transition-all duration-200",
						localIsCopied
							? "scale-0 opacity-0"
							: "scale-100 opacity-100",
					)}
				/>
			</div>
			{children}
		</button>
	);
}
