import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wand2, Fingerprint } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

interface IdTypeTabsProps {
	idTypeTab: "system" | "dynamic";
	setIdTypeTab: (v: "system" | "dynamic") => void;
	customId: string;
	setCustomId: (v: string) => void;
	onSubmit: () => void;
}

export const IdTypeTabs = ({
	idTypeTab,
	setIdTypeTab,
	customId,
	setCustomId,
	onSubmit,
}: IdTypeTabsProps) => {
	const { t } = useTranslation();

	return (
		<Tabs
			value={idTypeTab}
			onValueChange={(v) => setIdTypeTab(v as "system" | "dynamic")}
			className="w-full"
		>
			<TabsList className="grid w-full grid-cols-2 mb-4 h-12 sm:h-auto">
				<TabsTrigger
					value="system"
					className="text-[11px] sm:text-sm px-1 sm:px-3"
				>
					<Wand2 className="h-4 w-4 hidden min-[400px]:block mr-1 sm:mr-2" />
					{t("home.paste_system_id")}
				</TabsTrigger>
				<TabsTrigger
					value="dynamic"
					className="text-[11px] sm:text-sm px-1 sm:px-3"
				>
					<Fingerprint className="h-4 w-4 hidden min-[400px]:block mr-1 sm:mr-2" />
					{t("home.paste_dynamic_id")}
				</TabsTrigger>
			</TabsList>

			<TabsContent value="system" className="mt-0 mb-4">
				<p className="text-sm text-muted-foreground text-center py-2 bg-muted/30 rounded-md">
					{t("home.paste_system_id_desc")}
				</p>
			</TabsContent>

			<TabsContent value="dynamic" className="mt-0 space-y-4 mb-4">
				<div className="space-y-2">
					<Input
						placeholder={t("home.dynamic_id_dialog.placeholder")}
						value={customId}
						className="h-11 focus-visible:ring-primary/50"
						onChange={(e) => setCustomId(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && onSubmit()}
					/>
					{customId.trim() && (
						<p className="text-xs text-muted-foreground ml-1 flex items-center gap-1">
							{t("home.dynamic_id_dialog.preview")}{" "}
							<span className="text-primary font-medium">
								{window.location.origin}/{customId}
							</span>
						</p>
					)}
				</div>
			</TabsContent>
		</Tabs>
	);
};
