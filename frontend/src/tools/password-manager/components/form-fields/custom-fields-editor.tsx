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
		<div className="space-y-2 px-5">
			<div className="flex items-center justify-between">
				<Label className="text-sm font-medium">
					{t("tools.password_manager_custom_fields")}
				</Label>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={addField}
				>
					<Plus className="h-3 w-3 mr-1" />
					{t("tools.password_manager_add_field")}
				</Button>
			</div>
			{customFields.map((field, i) => (
				<div key={i} className="flex gap-2 items-start">
					<Input
						placeholder={t("tools.password_manager_field_name")}
						value={field.name}
						onChange={(e) => updateField(i, "name", e.target.value)}
						className="flex-1"
					/>
					<Select
						value={field.type}
						onValueChange={(val) => updateField(i, "type", val)}
					>
						<SelectTrigger className="w-28">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{CUSTOM_FIELD_TYPES.map((ft) => (
								<SelectItem key={ft} value={ft}>
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
						placeholder={t("tools.password_manager_field_value")}
						value={field.value}
						onChange={(e) =>
							updateField(i, "value", e.target.value)
						}
						className={
							field.type === "color" ? "w-12 h-9 p-1" : "flex-1"
						}
					/>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => removeField(i)}
						className="shrink-0"
					>
						<Trash2 className="h-4 w-4 text-red-500" />
					</Button>
				</div>
			))}
		</div>
	);
}
