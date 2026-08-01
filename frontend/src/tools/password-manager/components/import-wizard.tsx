import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { ParsedImportItem, DuplicateStrategy } from "../utils/importers/types";
import StepFileSelect from "./import-steps/step-file-select";
import StepParsePreview from "./import-steps/step-parse-preview";
import StepOneByOne from "./import-steps/step-one-by-one";
import StepBulkImport from "./import-steps/step-bulk-import";
import StepDone from "./import-steps/step-done";

type ImportStep = "FILE_SELECT" | "PARSE_PREVIEW" | "ONE_BY_ONE" | "BULK_IMPORT" | "DONE";

interface ImportWizardProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function ImportWizard({ isOpen, onClose }: ImportWizardProps) {
	const { t } = useTranslation();
	const [step, setStep] = useState<ImportStep>("FILE_SELECT");
	const [parsedItems, setParsedItems] = useState<ParsedImportItem[]>([]);
	const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategy>("ask");

	// Stats for DONE step
	const [importedCount, setImportedCount] = useState(0);
	const [skippedCount, setSkippedCount] = useState(0);

	const handleReset = () => {
		setStep("FILE_SELECT");
		setParsedItems([]);
		setDuplicateStrategy("ask");
		setImportedCount(0);
		setSkippedCount(0);
	};

	const handleClose = () => {
		handleReset();
		onClose();
	};

	const renderStep = () => {
		switch (step) {
			case "FILE_SELECT":
				return (
					<StepFileSelect
						onNext={(items: ParsedImportItem[]) => {
							setParsedItems(items);
							setStep("PARSE_PREVIEW");
						}}
						onCancel={handleClose}
					/>
				);
			case "PARSE_PREVIEW":
				return (
					<StepParsePreview
						items={parsedItems}
						duplicateStrategy={duplicateStrategy}
						onDuplicateStrategyChange={setDuplicateStrategy}
						onBack={() => setStep("FILE_SELECT")}
						onNext={(mode: "bulk" | "one_by_one") => setStep(mode === "bulk" ? "BULK_IMPORT" : "ONE_BY_ONE")}
					/>
				);
			case "ONE_BY_ONE":
				return (
					<StepOneByOne
						items={parsedItems}
						duplicateStrategy={duplicateStrategy}
						onDone={(imported: number, skipped: number) => {
							setImportedCount(imported);
							setSkippedCount(skipped);
							setStep("DONE");
						}}
						onCancel={handleClose}
					/>
				);
			case "BULK_IMPORT":
				return (
					<StepBulkImport
						items={parsedItems}
						duplicateStrategy={duplicateStrategy}
						onDone={(imported: number, skipped: number) => {
							setImportedCount(imported);
							setSkippedCount(skipped);
							setStep("DONE");
						}}
						onCancel={handleClose}
					/>
				);
			case "DONE":
				return (
					<StepDone
						total={parsedItems.length}
						imported={importedCount}
						skipped={skippedCount}
						onClose={handleClose}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent className="sm:max-w-175 p-0 overflow-hidden flex flex-col max-h-[85vh]">
				<DialogHeader className="px-6 py-4 border-b border-pm-border">
					<DialogTitle>{t("password_manager_import_title")}</DialogTitle>
					<DialogDescription>
						{t("password_manager_import_description")}
					</DialogDescription>
				</DialogHeader>
				<div className="flex-1 overflow-y-auto">
					{renderStep()}
				</div>
			</DialogContent>
		</Dialog>
	);
}
