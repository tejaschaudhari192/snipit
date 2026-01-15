import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Code2, Link } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/editor/language-selector";
import { Button } from "@/components/ui/button";

interface EditControlsProps {
	contentType: "text" | "code" | "link";
	setContentType: (v: "text" | "code" | "link") => void;
	language: string;
	setLanguage: (v: string) => void;
	isDetecting: boolean;
	onAutoDetect: () => void;
	showLanguageSelector: boolean;
}

export const EditControls = ({
	contentType,
	setContentType,
	language,
	setLanguage,
	isDetecting,
	onAutoDetect,
	showLanguageSelector,
}: EditControlsProps) => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-4">
			<Tabs
				value={contentType}
				onValueChange={(val) =>
					setContentType(val as "text" | "code" | "link")
				}
				className="w-full md:w-auto"
			>
				<TabsList className="h-10">
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

			<div className="flex items-center gap-2">
				{showLanguageSelector && (
					<>
						<LanguageSelector
							value={language}
							onValueChange={setLanguage}
							isDetecting={isDetecting}
							className="w-[240px]"
						/>
						{!isDetecting && (
							<Button
								variant="ghost"
								size="sm"
								className="h-10 px-3 text-muted-foreground hover:text-foreground"
								onClick={onAutoDetect}
								title="Auto detect language"
							>
								<Code2 className="h-4 w-4" />
							</Button>
						)}
					</>
				)}
			</div>
		</div>
	);
};
