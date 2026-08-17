import { lazy, Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wand2, Fingerprint, Hash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils";

import { IdTabSkeleton } from "./id-tab-skeleton";

const AutoIdTab = lazy(() => import("./auto-id-tab"));
const CustomIdTab = lazy(() => import("./custom-id-tab"));
const SemanticIdTab = lazy(() => import("./semantic-id-tab"));
import { type AiIdFileContext, type IdTypeTab } from "@/types";

interface IdTypeTabsProps {
	idTypeTab: IdTypeTab;
	setIdTypeTab: (v: IdTypeTab) => void;
	customId: string;
	setCustomId: (v: string) => void;
	onSubmit: () => void;
	compact?: boolean;
	textValue?: string;
	files?: AiIdFileContext[];
	disabled?: boolean;
	pasteId?: string;
}

export const IdTypeTabs = ({
	idTypeTab,
	setIdTypeTab,
	customId,
	setCustomId,
	onSubmit,
	compact = false,
	textValue,
	files,
	disabled = false,
	pasteId,
}: IdTypeTabsProps) => {
	const { t } = useTranslation();

	return (
		<Tabs
			value={idTypeTab}
			onValueChange={(v) => !disabled && setIdTypeTab(v as IdTypeTab)}
			className="w-full flex-col"
		>
			<TabsList className="flex w-full items-center justify-between h-9 mb-4 p-1 gap-1">
				<TabsTrigger
					value="system"
					className="flex-1 px-1.5 py-1 text-xs gap-1.5 min-w-0"
					disabled={disabled}
					title={t("home.id_generation.automatic")}
				>
					<Fingerprint className="h-3.5 w-3.5 shrink-0" />
					<span className="truncate">
						{compact ? "Auto" : t("home.id_generation.automatic")}
					</span>
				</TabsTrigger>
				<TabsTrigger
					value="dynamic"
					className="flex-1 px-1.5 py-1 text-xs gap-1.5 min-w-0"
					disabled={disabled}
					title={t("home.id_generation.custom")}
				>
					<Wand2 className="h-3.5 w-3.5 shrink-0" />
					<span className="truncate">
						{compact ? "Custom" : t("home.id_generation.custom")}
					</span>
				</TabsTrigger>
				<TabsTrigger
					value="semantic"
					className="flex-1 px-1.5 py-1 text-xs gap-1.5 min-w-0"
					disabled={disabled}
					title={t("home.id_generation.semantic_tab")}
				>
					<Hash className="h-3.5 w-3.5 shrink-0" />
					<span className="truncate">
						{compact
							? "Words"
							: t("home.id_generation.semantic_tab")}
					</span>
				</TabsTrigger>
			</TabsList>

			<div
				className={cn(
					"transition-all duration-300",
					compact ? "min-h-0" : "min-h-35",
				)}
			>
				<Suspense fallback={<IdTabSkeleton rows={2} />}>
					<TabsContent value="system" className="mt-0">
						<AutoIdTab />
					</TabsContent>

					<TabsContent value="dynamic" className="mt-0">
						<CustomIdTab
							customId={customId}
							setCustomId={setCustomId}
							onSubmit={onSubmit}
							textValue={textValue}
							files={files}
							disabled={disabled}
							pasteId={pasteId}
						/>
					</TabsContent>

					<TabsContent value="semantic" className="mt-0">
						<SemanticIdTab
							customId={customId}
							setCustomId={setCustomId}
							onSubmit={onSubmit}
							disabled={disabled}
							pasteId={pasteId}
						/>
					</TabsContent>
				</Suspense>
			</div>
		</Tabs>
	);
};
