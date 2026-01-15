import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Code2, Link, Shield, Users, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/editor/language-selector";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MultiEmailInput } from "@/components/ui/multi-email-input";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EditControlsProps {
	contentType: "text" | "code" | "link";
	setContentType: (v: "text" | "code" | "link") => void;
	language: string;
	setLanguage: (v: string) => void;
	visibility: "public" | "private" | "shared";
	setVisibility: (v: "public" | "private" | "shared") => void;
	allowedUsers: string[];
	setAllowedUsers: (v: string[]) => void;
	isDetecting: boolean;
	onAutoDetect: () => void;
	customId: string;
	setCustomId: (v: string) => void;
}

export const EditControls = ({
	contentType,
	setContentType,
	language,
	setLanguage,
	visibility,
	setVisibility,
	allowedUsers,
	setAllowedUsers,
	isDetecting,
	onAutoDetect,
	customId,
	setCustomId,
}: EditControlsProps) => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
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

				<div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
					<div className="relative group flex-1 sm:flex-initial">
						<Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
						<Input
							value={customId}
							onChange={(e) => setCustomId(e.target.value)}
							placeholder="Custom ID (optional)..."
							className="pl-9 h-11 w-full sm:w-48 bg-muted/20 border-transparent focus:border-border transition-all"
						/>
					</div>

					<Select
						value={visibility}
						onValueChange={(val: "public" | "private" | "shared") =>
							setVisibility(val)
						}
					>
						<SelectTrigger className="flex-1 sm:w-fit min-w-[130px] h-11">
							<div className="flex items-center gap-2">
								<Shield className="h-4 w-4 text-muted-foreground" />
								<SelectValue placeholder="Visibility" />
							</div>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="public">Public</SelectItem>
							<SelectItem value="private">Private</SelectItem>
							<SelectItem value="shared">Shared</SelectItem>
						</SelectContent>
					</Select>

					{contentType === "code" && (
						<div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
							<LanguageSelector
								value={language}
								onValueChange={setLanguage}
								isDetecting={isDetecting}
								className="w-full sm:w-[180px] h-11"
							/>
							{!isDetecting && (
								<Button
									variant="outline"
									size="icon"
									className="h-11 w-11 shrink-0"
									onClick={onAutoDetect}
									title="Auto detect language"
								>
									<Code2 className="h-4 w-4" />
								</Button>
							)}
						</div>
					)}
				</div>
			</div>

			{visibility === "shared" && (
				<div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
					<Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 ml-1">
						<Users className="h-3 w-3" />
						Collaborators
					</Label>
					<MultiEmailInput
						value={allowedUsers}
						onChange={setAllowedUsers}
						placeholder="Enter emails..."
						className="w-full min-h-[44px] bg-background/50 backdrop-blur-sm border-primary/10 focus-within:border-primary/30 transition-colors"
					/>
				</div>
			)}
		</div>
	);
};
