import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
	Link as LinkIcon,
	AlertCircle,
	Timer,
	Zap,
	MousePointerClick,
	ExternalLink,
	Loader2,
	ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RedirectionType } from "@/types";

interface LinkViewProps {
	isEdit: boolean;
	content: string;
	onContentChange: (val: string) => void;
	contentRef: (node: HTMLElement | null) => void;
	isAdmin?: boolean;
	redirectionType?: RedirectionType;
}

export const LinkView = ({
	isEdit,
	content,
	onContentChange,
	contentRef,
	isAdmin = false,
	redirectionType = "click",
}: LinkViewProps) => {
	const { t } = useTranslation();
	const [timeLeft, setTimeLeft] = useState(5);

	const getDestinationUrl = (url: string) => {
		if (!url) return "#";
		return /^https?:\/\//i.test(url) ? url : `https://${url}`;
	};

	const getDisplayDomain = (url: string) => {
		try {
			const destination = getDestinationUrl(url);
			if (destination === "#") return "";
			const parsed = new URL(destination);
			return parsed.hostname;
		} catch {
			return url;
		}
	};

	const handleVisit = () => {
		window.location.href = getDestinationUrl(content);
	};

	// Immediate direct redirection for non-admins
	useEffect(() => {
		if (isEdit || isAdmin) return;
		if (redirectionType === "direct") {
			window.location.href = getDestinationUrl(content);
		}
	}, [isEdit, isAdmin, redirectionType, content]);

	// Countdown timer for 5s Timer mode for non-admins
	useEffect(() => {
		if (isEdit || isAdmin) return;
		if (redirectionType !== "timer") return;

		if (timeLeft <= 0) {
			window.location.href = getDestinationUrl(content);
			return;
		}

		const interval = setInterval(() => {
			setTimeLeft((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(interval);
	}, [timeLeft, isEdit, isAdmin, redirectionType, content]);

	if (isEdit) {
		return (
			<div
				ref={contentRef}
				className="flex flex-col items-center py-16 px-4 bg-background/60 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl ring-1 ring-white/5 relative z-10 animate-in fade-in zoom-in-95 duration-700 max-w-150 mx-auto mt-4 w-full"
			>
				<div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-xl shadow-primary/5">
					<LinkIcon className="w-10 h-10 text-primary" />
				</div>
				<h3 className="text-2xl font-black mb-3">
					{t("home.tab_link")}
				</h3>
				<p className="text-muted-foreground mb-8 text-center max-w-sm font-medium">
					{t("home.link_desc")}
				</p>
				<div className="w-full max-w-md">
					<Input
						value={content}
						onChange={(e) => onContentChange(e.target.value)}
						placeholder={t("home.link_placeholder")}
						className="h-12 text-base px-5 rounded-xl border-primary/20 focus-visible:ring-primary/20 bg-background shadow-inner text-center"
					/>
				</div>
			</div>
		);
	}

	// Admin Preview Bypass layout
	if (isAdmin) {
		const getModeDetails = () => {
			switch (redirectionType) {
				case "direct":
					return {
						icon: <Zap className="w-4 h-4 text-amber-500" />,
						title: t("common.redirection_direct"),
						color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
					};
				case "timer":
					return {
						icon: <Timer className="w-4 h-4 text-indigo-500" />,
						title: t("common.redirection_timer"),
						color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
					};
				default:
					return {
						icon: (
							<MousePointerClick className="w-4 h-4 text-emerald-500" />
						),
						title: t("common.redirection_click"),
						color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
					};
			}
		};

		const mode = getModeDetails();

		return (
			<div
				ref={contentRef}
				className="flex flex-col items-center justify-center p-6 sm:p-10 bg-background/60 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl ring-1 ring-white/5 relative z-10 animate-in fade-in zoom-in-95 duration-700 max-w-160 mx-auto mt-6 w-full gap-6"
			>
				{/* Admin Warning Banner */}
				<div className="w-full flex items-start gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md shadow-lg shadow-amber-500/5">
					<div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 mt-0.5 shrink-0">
						<AlertCircle className="w-5 h-5 animate-pulse" />
					</div>
					<div className="flex-1 flex flex-col gap-1">
						<h4 className="text-sm font-bold text-amber-500 leading-tight">
							{t("common.admin_preview_banner")}
						</h4>
						<p className="text-xs text-muted-foreground/80 font-medium">
							To test the live auto-redirection flow, open this
							link in an Incognito window or access it as a guest.
						</p>
					</div>
				</div>

				<div className="w-full flex flex-col items-center py-6 px-4 bg-muted/20 rounded-2xl border border-border/30 relative overflow-hidden">
					<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 shadow-xl shadow-primary/5">
						<LinkIcon className="w-8 h-8 text-primary" />
					</div>

					<div className="flex items-center gap-2 mb-2">
						<h3 className="text-xl font-bold">
							{t("common.redirect_ready")}
						</h3>
						<span
							className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${mode.color} shadow-sm`}
						>
							{mode.icon}
							{mode.title}
						</span>
					</div>

					<p className="text-xs text-muted-foreground text-center font-semibold mb-4 bg-muted/40 px-3 py-1 rounded-md border border-border/20 break-all max-w-full">
						{getDestinationUrl(content)}
					</p>

					<p className="text-muted-foreground mb-6 text-center max-w-md text-sm font-medium">
						{t("common.redirect_desc")}
					</p>

					<a
						href={getDestinationUrl(content)}
						target="_blank"
						rel="noopener noreferrer"
						className="group relative inline-flex items-center justify-center px-8 py-3.5 font-bold text-white transition-all duration-200 bg-primary rounded-xl hover:bg-primary/90 shadow-xl shadow-primary/20 active:scale-95 text-sm"
					>
						{t("common.visit_link")}
						<div className="ml-2 group-hover:translate-x-1 transition-transform">
							<ExternalLink className="w-4 h-4" />
						</div>
					</a>
				</div>
			</div>
		);
	}

	// Public Visitor Layout - Direct Redirection
	if (redirectionType === "direct") {
		return (
			<div
				ref={contentRef}
				className="flex flex-col items-center justify-center py-20 px-8 bg-background/60 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl ring-1 ring-white/5 relative z-10 animate-in fade-in zoom-in-95 duration-700 max-w-125 mx-auto mt-16 w-full"
			>
				<div className="relative w-20 h-20 mb-8 flex items-center justify-center">
					<div className="absolute inset-0 bg-primary/25 blur-xl rounded-full animate-pulse" />
					<div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg">
						<Loader2 className="w-8 h-8 text-primary animate-spin" />
					</div>
				</div>

				<h3 className="text-2xl font-black mb-3 text-center bg-linear-to-r from-primary to-purple-500 bg-clip-text text-transparent animate-pulse">
					{t("common.redirecting_now")}
				</h3>

				<p className="text-sm text-muted-foreground/80 font-medium mb-6 text-center max-w-sm">
					Hold tight! We are sending you to your destination
					instantly.
				</p>

				<div className="flex flex-col items-center gap-1 bg-muted/30 px-4 py-2.5 rounded-xl border border-border/20 w-full max-w-85">
					<span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
						Destination Domain
					</span>
					<span className="text-sm font-semibold truncate max-w-full text-foreground/90">
						{getDisplayDomain(content)}
					</span>
				</div>
			</div>
		);
	}

	// Public Visitor Layout - 5s Countdown Timer
	if (redirectionType === "timer") {
		const radius = 40;
		const strokeWidth = 6;
		const circumference = 2 * Math.PI * radius;
		const progress = timeLeft / 5;
		const strokeDashoffset = circumference * (1 - progress);

		return (
			<div
				ref={contentRef}
				className="flex flex-col items-center justify-center py-16 px-6 sm:px-8 bg-background/60 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl ring-1 ring-white/5 relative z-10 animate-in fade-in zoom-in-95 duration-700 max-w-125 mx-auto mt-12 w-full"
			>
				<div className="relative w-28 h-28 mb-6 flex items-center justify-center">
					<div className="absolute inset-0 bg-primary/15 blur-lg rounded-full animate-pulse" />
					<svg className="w-full h-full transform -rotate-90">
						<circle
							cx="56"
							cy="56"
							r={radius}
							className="stroke-muted/20"
							strokeWidth={strokeWidth}
							fill="transparent"
						/>
						<circle
							cx="56"
							cy="56"
							r={radius}
							className="stroke-primary transition-all duration-1000 ease-linear"
							strokeWidth={strokeWidth}
							fill="transparent"
							strokeDasharray={circumference}
							strokeDashoffset={strokeDashoffset}
							strokeLinecap="round"
						/>
					</svg>
					<div className="absolute flex flex-col items-center justify-center">
						<span className="text-4xl font-extrabold text-foreground tracking-tight">
							{timeLeft}
						</span>
						<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
							Secs
						</span>
					</div>
				</div>

				<h3 className="text-2xl font-black mb-2 text-center">
					{t("common.redirect_ready")}
				</h3>

				<p className="text-muted-foreground/95 mb-6 text-center max-w-sm text-sm font-medium">
					{t("common.redirecting_in", { count: timeLeft })}
				</p>

				<div className="flex flex-col items-center gap-1 bg-muted/20 px-4 py-2.5 rounded-xl border border-border/20 w-full max-w-85 mb-8">
					<span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
						Destination Domain
					</span>
					<span className="text-sm font-semibold truncate max-w-full text-foreground/90">
						{getDisplayDomain(content)}
					</span>
				</div>

				<button
					onClick={handleVisit}
					className="group relative inline-flex items-center justify-center w-full sm:w-auto px-10 py-4 font-bold text-white transition-all duration-200 bg-primary rounded-2xl hover:bg-primary/90 shadow-xl shadow-primary/20 active:scale-95"
				>
					{t("common.skip_countdown")}
					<div className="ml-2 group-hover:translate-x-1 transition-transform">
						<ArrowRight className="w-5 h-5" />
					</div>
				</button>
			</div>
		);
	}

	// Public Visitor Layout - Click-to-Visit (Default)
	return (
		<div
			ref={contentRef}
			className="flex flex-col items-center justify-center py-24 px-4 bg-background/60 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl ring-1 ring-white/5 relative z-10 animate-in fade-in zoom-in-95 duration-700 max-w-150 mx-auto mt-10"
		>
			<div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-xl shadow-primary/5">
				<LinkIcon className="w-10 h-10 text-primary" />
			</div>
			<h3 className="text-2xl font-black mb-3">
				{t("common.redirect_ready")}
			</h3>
			<p className="text-muted-foreground mb-8 text-center max-w-md font-medium">
				{t("common.redirect_desc")}
			</p>
			<a
				href={getDestinationUrl(content)}
				target="_blank"
				rel="noopener noreferrer"
				className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-200 bg-primary rounded-2xl hover:bg-primary/90 shadow-xl shadow-primary/20 active:scale-95"
			>
				{t("common.visit_link")}
				<div className="ml-2 group-hover:translate-x-1 transition-transform">
					🚀
				</div>
			</a>
		</div>
	);
};
