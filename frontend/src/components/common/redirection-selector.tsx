import { memo } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRightLeft, MousePointerClick, Timer, Zap } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LockedSettingWrapper } from "@/components/common/locked-setting-wrapper";
import type { RedirectionType } from "@/types";

export interface RedirectionSelectorProps {
	redirectionType: RedirectionType;
	setRedirectionType?: (v: RedirectionType) => void;
	disabled?: boolean;
	isOwner: boolean;
	isAdmin: boolean;
	tooltipText?: string;
}

export const RedirectionSelector = memo(
	({
		redirectionType,
		setRedirectionType,
		disabled = false,
		isOwner,
		isAdmin,
		tooltipText = "",
	}: RedirectionSelectorProps) => {
		const { t } = useTranslation();

		return (
			<div className="animate-in fade-in slide-in-from-top-3 duration-300">
				<div className="flex items-center gap-2 mb-2 group/header">
					<div className="p-1.5 rounded-lg bg-primary/5 text-primary group-hover/header:bg-primary group-hover/header:text-white transition-all duration-300">
						<ArrowRightLeft className="h-3.5 w-3.5" />
					</div>
					<span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 group-hover/header:text-primary transition-colors">
						{t("common.redirection_mode")}
					</span>
				</div>
				<LockedSettingWrapper
					disabled={!(isOwner || isAdmin) || disabled}
					tooltipText={tooltipText}
				>
					<div className="flex flex-col gap-2">
						<Tabs
							value={redirectionType}
							onValueChange={(v) =>
								setRedirectionType?.(v as RedirectionType)
							}
							className="w-full"
						>
							<TabsList className="grid w-full grid-cols-3 h-9">
								<TabsTrigger
									value="click"
									className="text-xs"
									disabled={!(isOwner || isAdmin) || disabled}
								>
									<MousePointerClick className="h-3.5 w-3.5 mr-1.5" />
									{t(
										"common.redirection_click",
										"Click to Visit",
									)}
								</TabsTrigger>
								<TabsTrigger
									value="timer"
									className="text-xs"
									disabled={!(isOwner || isAdmin) || disabled}
								>
									<Timer className="h-3.5 w-3.5 mr-1.5" />
									{t(
										"common.redirection_timer",
										"5s Countdown",
									)}
								</TabsTrigger>
								<TabsTrigger
									value="direct"
									className="text-xs"
									disabled={!(isOwner || isAdmin) || disabled}
								>
									<Zap className="h-3.5 w-3.5 mr-1.5" />
									{t(
										"common.redirection_direct",
										"Direct Redirect",
									)}
								</TabsTrigger>
							</TabsList>
						</Tabs>
						<div className="mt-1 text-[11px] text-muted-foreground/80 font-medium px-1 flex items-center gap-1.5 animate-in fade-in duration-200">
							{redirectionType === "click" && (
								<>
									<span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
									<span>
										{t(
											"common.redirection_click_desc",
											"Requires manual button click",
										)}
									</span>
								</>
							)}
							{redirectionType === "timer" && (
								<>
									<span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
									<span>
										{t(
											"common.redirection_timer_desc",
											"Redirects after a 5-second countdown",
										)}
									</span>
								</>
							)}
							{redirectionType === "direct" && (
								<>
									<span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
									<span>
										{t(
											"common.redirection_direct_desc",
											"Instant, seamless redirection",
										)}
									</span>
								</>
							)}
						</div>
					</div>
				</LockedSettingWrapper>
			</div>
		);
	},
);

RedirectionSelector.displayName = "RedirectionSelector";
