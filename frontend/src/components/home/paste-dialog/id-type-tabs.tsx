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
			<TabsList className="grid w-full grid-cols-2 h-9 mb-4">
				<TabsTrigger value="system" className="text-xs">
					<Wand2 className="h-3.5 w-3.5 mr-2" />
					{t("home.paste_system_id")}
				</TabsTrigger>
				<TabsTrigger value="dynamic" className="text-xs">
					<Fingerprint className="h-3.5 w-3.5 mr-2" />
					{t("home.paste_dynamic_id")}
				</TabsTrigger>
			</TabsList>

			<TabsContent value="system" className="mt-0">
				<div className="flex flex-col items-center justify-center p-4 rounded-lg bg-card/40 border border-dashed border-border/40 min-h-[80px]">
					<p className="text-[13px] text-muted-foreground font-medium text-center">
						{t("home.paste_system_id_desc")}
					</p>
				</div>
			</TabsContent>

			<TabsContent value="dynamic" className="mt-0">
				<div className="flex flex-col space-y-2 min-h-[80px]">
					<Input
						placeholder={t("home.dynamic_id_dialog.placeholder")}
						value={customId}
						className="h-10 text-sm focus-visible:ring-primary/40 transition-shadow bg-card/40 hover:bg-card/60"
						onChange={(e) => setCustomId(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && onSubmit()}
					/>
					{customId.trim() && (
						<p className="text-xs text-muted-foreground ml-1 flex items-center gap-1 animate-in fade-in duration-200">
							{t("home.dynamic_id_dialog.preview")}{" "}
							<span className="text-primary font-medium truncate">
								/{customId}
							</span>
						</p>
					)}
				</div>
			</TabsContent>
		</Tabs>
	);
};
