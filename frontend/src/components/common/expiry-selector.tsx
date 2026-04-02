import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface ExpirySelectorProps {
	expiresTime: string;
	setExpiresTime: (val: string) => void;
	setIsCustomExpiryDialogOpen: (val: boolean) => void;
	className?: string;
}

export const ExpirySelector = memo(
	({
		expiresTime,
		setExpiresTime,
		setIsCustomExpiryDialogOpen,
		className,
	}: ExpirySelectorProps) => {
		const { t } = useTranslation();

		const isCustomDate =
			expiresTime.includes("-") && expiresTime !== "one-time";

		return (
			<Select
				value={expiresTime}
				onValueChange={(val) => {
					if (val === "custom_action") {
						setIsCustomExpiryDialogOpen(true);
					} else {
						setExpiresTime(val);
					}
				}}
			>
				<SelectTrigger
					className={cn(
						"w-full sm:w-fit min-w-[140px] px-4 h-11 bg-background/95 backdrop-blur-sm border-border/50 shadow-sm hover:bg-muted/50 hover:border-border transition-all rounded-lg font-bold text-sm",
						className,
					)}
				>
					<div className="flex items-center gap-2 whitespace-nowrap">
						<Clock className="h-4 w-4 text-primary shrink-0" />
						<SelectValue
							placeholder={t("home.select_expire_time")}
						/>
					</div>
				</SelectTrigger>

				<SelectContent className="rounded-xl shadow-xl border-border/40 p-1">
					<SelectGroup className="space-y-0.5">
						<SelectItem
							value="one-time"
							className="rounded-lg cursor-pointer"
						>
							{t("home.expire_options.one_time_snippet")}
						</SelectItem>
						<SelectItem
							value="1h"
							className="rounded-lg cursor-pointer"
						>
							{t("home.expire_options.expire_in_1_hour")}
						</SelectItem>
						<SelectItem
							value="1d"
							className="rounded-lg cursor-pointer"
						>
							{t("home.expire_options.expire_in_1_day")}
						</SelectItem>
						<SelectItem
							value="1w"
							className="rounded-lg cursor-pointer"
						>
							{t("home.expire_options.expire_in_1_week")}
						</SelectItem>
						<SelectItem
							value="1m"
							className="rounded-lg cursor-pointer"
						>
							{t("home.expire_options.expire_in_1_month")}
						</SelectItem>
						<SelectItem
							value="1y"
							className="rounded-lg cursor-pointer"
						>
							{t("home.expire_options.expire_in_1_year")}
						</SelectItem>

						{/* 
                      Visible item for picking/uploading custom date. 
                      Always clickable because value is stable 'custom_action'.
                    */}
						<SelectItem
							value="custom_action"
							className="rounded-lg cursor-pointer font-semibold text-primary"
						>
							{t("home.expire_options.custom")}
						</SelectItem>

						{/* 
                      Hidden item representing the current custom date value. 
                      Necessary for SelectValue to display the formatted date.
                    */}
						{isCustomDate && (
							<SelectItem value={expiresTime} className="hidden">
								{new Date(expiresTime).toLocaleString([], {
									month: "short",
									day: "numeric",
									hour: "numeric",
									minute: "2-digit",
									hour12: true,
								})}
							</SelectItem>
						)}
					</SelectGroup>
				</SelectContent>
			</Select>
		);
	},
);
