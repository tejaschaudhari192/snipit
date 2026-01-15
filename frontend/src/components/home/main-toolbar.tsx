import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FileText, Code2, Link, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MainToolbarProps {
	contentType: "text" | "code" | "link";
	setContentType: (val: "text" | "code" | "link") => void;
	expiresTime: string;
	setExpiresTime: (val: string) => void;
	setIsCustomExpiryDialogOpen: (val: boolean) => void;
	textValue: string;
	handleCreationClick: () => void;
}

export const MainToolbar = ({
	contentType,
	setContentType,
	expiresTime,
	setExpiresTime,
	setIsCustomExpiryDialogOpen,
	textValue,
	handleCreationClick,
}: MainToolbarProps) => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
			<Tabs
				value={contentType}
				onValueChange={(val) =>
					setContentType(val as "text" | "code" | "link")
				}
				className="w-full sm:w-auto"
			>
				<TabsList className="h-11 w-full flex">
					<TabsTrigger
						value="text"
						className="flex-1 flex items-center justify-center gap-2 px-3 text-sm font-semibold"
					>
						<FileText className="h-4 w-4 shrink-0" />
						<span className="whitespace-nowrap">
							{t("home.tab_text")}
						</span>
					</TabsTrigger>
					<TabsTrigger
						value="code"
						className="flex-1 flex items-center justify-center gap-2 px-3 text-sm font-semibold"
					>
						<Code2 className="h-4 w-4 shrink-0" />
						<span className="whitespace-nowrap">
							{t("home.tab_code")}
						</span>
					</TabsTrigger>
					<TabsTrigger
						value="link"
						className="flex-1 flex items-center justify-center gap-2 px-3 text-sm font-semibold"
					>
						<Link className="h-4 w-4 shrink-0" />
						<span className="whitespace-nowrap">
							{t("home.tab_link")}
						</span>
					</TabsTrigger>
				</TabsList>
			</Tabs>

			<div className="flex items-center gap-2 justify-between sm:justify-end">
				<Select
					value={
						expiresTime.includes("-") && expiresTime !== "one-time"
							? "custom"
							: expiresTime
					}
					onValueChange={(val) => {
						if (val === "custom") {
							setIsCustomExpiryDialogOpen(true);
						} else {
							setExpiresTime(val);
						}
					}}
				>
					<SelectTrigger className="flex-1 sm:w-fit h-11">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<SelectValue
								placeholder={t("home.select_expire_time")}
							/>
						</div>
					</SelectTrigger>

					<SelectContent>
						<SelectGroup>
							<SelectItem value="one-time">
								{t("home.expire_options.one_time_snippet")}
							</SelectItem>
							<SelectItem value="1h">
								{t("home.expire_options.expire_in_1_hour")}
							</SelectItem>
							<SelectItem value="1d">
								{t("home.expire_options.expire_in_1_day")}
							</SelectItem>
							<SelectItem value="1w">
								{t("home.expire_options.expire_in_1_week")}
							</SelectItem>
							<SelectItem value="1m">
								{t("home.expire_options.expire_in_1_month")}
							</SelectItem>
							<SelectItem value="1y">
								{t("home.expire_options.expire_in_1_year")}
							</SelectItem>
							<SelectItem value="custom">
								{expiresTime.includes("-") &&
								expiresTime !== "one-time"
									? new Date(expiresTime).toLocaleString([], {
											dateStyle: "short",
											timeStyle: "short",
										})
									: t("home.expire_options.custom")}
							</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>

				<Button
					disabled={!textValue.length}
					size="lg"
					className="px-6 h-11 shadow-lg shadow-primary/20 font-bold"
					onClick={handleCreationClick}
				>
					{t("home.paste_button")}
				</Button>
			</div>
		</div>
	);
};
