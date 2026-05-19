import { lazy, Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wand2, Fingerprint, Hash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils";

import { IdTabSkeleton } from "./id-tab-skeleton";

const AutoIdTab = lazy(() => import("./auto-id-tab"));
const CustomIdTab = lazy(() => import("./custom-id-tab"));
const SemanticIdTab = lazy(() => import("./semantic-id-tab"));
import { type AiIdFileContext } from "@/types";

interface IdTypeTabsProps {
	idTypeTab: "system" | "dynamic" | "semantic";
	setIdTypeTab: (v: "system" | "dynamic" | "semantic") => void;
	customId: string;
	setCustomId: (v: string) => void;
	onSubmit: () => void;
	compact?: boolean;
	textValue?: string;
	files?: AiIdFileContext[];
	disabled?: boolean;
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
}: IdTypeTabsProps) => {
	const { t } = useTranslation();

	return (
		<Tabs
			value={idTypeTab}
			onValueChange={(v) =>
				!disabled &&
				setIdTypeTab(v as "system" | "dynamic" | "semantic")
			}
			className="w-full"
		>
			<TabsList className="grid w-full grid-cols-3 h-9 mb-4">
				<TabsTrigger
					value="system"
					className="text-xs"
					disabled={disabled}
				>
					<Fingerprint className="h-3.5 w-3.5 mr-2" />
					{t("home.paste_system_id")}
				</TabsTrigger>
				<TabsTrigger
					value="dynamic"
					className="text-xs"
					disabled={disabled}
				>
					<Wand2 className="h-3.5 w-3.5 mr-2" />
					{t("home.paste_dynamic_id")}
				</TabsTrigger>
				<TabsTrigger
					value="semantic"
					className="text-xs"
					disabled={disabled}
				>
					<Hash className="h-3.5 w-3.5 mr-2" />
					{t("home.semantic_id_tab")}
				</TabsTrigger>
			</TabsList>

			<div
				className={cn(
					"transition-all duration-300",
					compact ? "min-h-0" : "min-h-[140px]",
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
						/>
					</TabsContent>

					<TabsContent value="semantic" className="mt-0">
						<SemanticIdTab
							customId={customId}
							setCustomId={setCustomId}
							onSubmit={onSubmit}
							disabled={disabled}
						/>
					</TabsContent>
				</Suspense>
			</div>
		</Tabs>
	);
};
