import { useState } from "react";
import { getFaviconUrl } from "@/tools/password-manager/utils/favicon";
import {
	getBrandColor,
	getInitials,
} from "@/tools/password-manager/utils/formatters";
import type { PasswordItem } from "@/tools/password-manager/types";
import { cn } from "@/utils";

interface ItemAvatarProps {
	item: PasswordItem;
	className?: string;
	imgClassName?: string;
	fallbackClassName?: string;
	fallbackTextClassName?: string;
	useTwoLetters?: boolean;
}

export function ItemAvatar({
	item,
	className = "w-8 h-8 flex",
	imgClassName = "object-contain",
	fallbackClassName = "w-8 h-8 rounded-[10px] shadow-sm",
	fallbackTextClassName = "text-white text-xs font-bold",
	useTwoLetters = false,
}: ItemAvatarProps) {
	const faviconUrl = getFaviconUrl(
		item.url || item.metadata?.url || item.metadata?.website,
	);
	const [imgError, setImgError] = useState(false);

	if (faviconUrl && !imgError) {
		return (
			<div className={className}>
				<img
					src={faviconUrl}
					alt=""
					className={imgClassName}
					onError={() => setImgError(true)}
				/>
			</div>
		);
	}

	const initials = useTwoLetters
		? item.title
			? item.title.substring(0, 2).toUpperCase()
			: "?"
		: getInitials(item.title);

	return (
		<div
			className={cn(
				"flex items-center justify-center shrink-0 overflow-hidden relative",
				getBrandColor(item.title),
				fallbackClassName,
			)}
		>
			<span className={cn("relative z-10", fallbackTextClassName)}>
				{initials}
			</span>
		</div>
	);
}
