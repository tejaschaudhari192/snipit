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
import { cn } from "@/utils";
import { memo } from "react";
import { EXPIRY_OPTIONS } from "@/constants";

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
					if (!val) return;
					if (val === "custom_action") {
						setIsCustomExpiryDialogOpen(true);
					} else {
						setExpiresTime(val);
					}
				}}
			>
				<SelectTrigger
					className={cn(
						"w-fit px-3 h-9 bg-background/95 backdrop-blur-xl border-border/50 shadow-sm hover:bg-primary/5 hover:border-primary/20 transition-all rounded-lg font-bold text-sm",
						className,
					)}
				>
					<div className="flex items-center gap-2 whitespace-nowrap">
						<Clock className="h-4 w-4 text-primary shrink-0" />
						<SelectValue placeholder={t("home.select_expire_time")}>
							{(() => {
								const selectedOption = EXPIRY_OPTIONS.find(
									(opt) => opt.value === expiresTime,
								);
								if (selectedOption) return t(selectedOption.labelKey);
								if (expiresTime === "custom_action")
									return t("home.expire_options.custom");
								if (isCustomDate) {
									return new Date(expiresTime).toLocaleString([], {
										month: "short",
										day: "numeric",
										year: "numeric",
										hour: "numeric",
										minute: "2-digit",
										hour12: true,
									});
								}
								return null;
							})()}
						</SelectValue>
					</div>
				</SelectTrigger>

				<SelectContent className="rounded-xl shadow-xl border-border/40 p-1">
					<SelectGroup className="space-y-0.5">
						{EXPIRY_OPTIONS.map((option) => (
							<SelectItem
								key={option.value}
								value={option.value}
								className="rounded-lg cursor-pointer"
							>
								{t(option.labelKey)}
							</SelectItem>
						))}

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
									year: "numeric",
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
