import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { CUSTOM_FIELD_TYPES } from "@/tools/password-manager/utils/constants";
import type { CustomField } from "@/tools/password-manager/types";

interface CustomFieldsEditorProps {
	customFields: CustomField[];
	addField: () => void;
	removeField: (index: number) => void;
	updateField: (index: number, key: keyof CustomField, val: string) => void;
}

export function CustomFieldsEditor({
	customFields,
	addField,
	removeField,
	updateField,
}: CustomFieldsEditorProps) {
	const { t } = useTranslation();

	return (
		<div className="space-y-3 px-6">
			<div className="flex items-center justify-between">
				<Label className="text-sm font-semibold text-foreground">
					{t("tools.password_manager.custom_fields", {
						defaultValue: "Custom Fields",
					})}
				</Label>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={addField}
					className="h-8 px-3 rounded-lg border-border/80 hover:bg-muted/50 font-medium text-xs gap-1.5"
				>
					<Plus className="h-3.5 w-3.5" />
					{t("tools.password_manager.add_field", {
						defaultValue: "Add Field",
					})}
				</Button>
			</div>

			{/* Styled Table-like Rows Matching Target Design */}
			{customFields.length > 0 && (
				<div className="border border-border/70 rounded-xl overflow-hidden bg-background divide-y divide-border/60">
					{/* Table Header */}
					<div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
						<span className="col-span-5">Field Name</span>
						<span className="col-span-6">Value</span>
						<span className="col-span-1 text-right"></span>
					</div>

					{/* Rows */}
					{customFields.map((field, i) => (
						<div
							key={field.id || i}
							className="grid grid-cols-12 gap-2 p-2.5 items-center hover:bg-muted/15 transition-colors"
						>
							<div className="col-span-5">
								<Input
									placeholder="Field Name"
									value={field.name}
									onChange={(e) =>
										updateField(i, "name", e.target.value)
									}
									className="h-8 text-sm bg-background/50 border-border/70 rounded-lg px-2.5"
								/>
							</div>

							<div className="col-span-6 flex gap-1.5 items-center">
								<Select
									value={field.type}
									onValueChange={(val) =>
										updateField(i, "type", val!)
									}
								>
									<SelectTrigger className="w-24 h-8 text-xs bg-background/50 border-border/70 rounded-lg">
										<SelectValue>{field.type}</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{CUSTOM_FIELD_TYPES.map((ft) => (
											<SelectItem
												key={ft}
												value={ft}
												className="text-xs"
											>
												{ft}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<Input
									type={
										field.type === "password"
											? "password"
											: field.type === "number"
												? "number"
												: field.type === "color"
													? "color"
													: "text"
									}
									placeholder="Value"
									value={field.value}
									onChange={(e) =>
										updateField(i, "value", e.target.value)
									}
									className={`h-8 text-sm bg-background/50 border-border/70 rounded-lg px-2.5 ${
										field.type === "color"
											? "w-10 p-0.5"
											: "flex-1"
									}`}
								/>
							</div>

							<div className="col-span-1 flex justify-end">
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => removeField(i)}
									className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg"
								>
									<Trash2 className="h-3.5 w-3.5" />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
