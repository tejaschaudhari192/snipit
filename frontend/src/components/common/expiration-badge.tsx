import { Timer } from "lucide-react";
import { cn, getTimeRemaining } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { GlassBadge } from "./core/glass-badge";

interface ExpirationBadgeProps {
	expiresAt: string | null;
	burnAfterRead: boolean;
	expiresTime?: string;
	className?: string;
}

export const ExpirationBadge = ({
	expiresAt,
	burnAfterRead,
	expiresTime,
	className,
}: ExpirationBadgeProps) => {
	const { t } = useTranslation();

	const isExpired = (expiresAt: string) => {
		return new Date(expiresAt).getTime() < Date.now();
	};

	const isExpiringSoon = (expiresAt: string) => {
		const hoursRemaining =
			(new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60);
		return hoursRemaining < 24 && hoursRemaining > 0;
	};

	if (!expiresAt) return null;

	const expired = isExpired(expiresAt);
	const expiringSoon = !expired && isExpiringSoon(expiresAt);

	const statusColor = expired
		? "bg-destructive/5 text-destructive border-destructive/20"
		: expiringSoon
			? "bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20"
			: "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";

	const text =
		burnAfterRead || expiresTime === "one-time"
			? t("home.expire_options.one_time_snippet")
			: expired
				? t("common.time.expired")
				: getTimeRemaining(expiresAt, t);

	return (
		<GlassBadge
			icon={<Timer className="h-3.5 w-3.5" />}
			className={cn(statusColor, className)}
			rounded="lg"
		>
			<span className="uppercase tracking-tight inline-block min-w-[60px] text-center">
				{text}
			</span>
		</GlassBadge>
	);
};
