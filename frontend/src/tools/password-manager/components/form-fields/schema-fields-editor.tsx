import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import PasswordGenerator from "@/tools/password-manager/components/password-generator";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { usePasswordStrength } from "@/hooks/use-password-strength";

export interface SchemaField {
	key: string;
	label: string;
	type: "text" | "password" | "email" | "multiline" | "url" | "number";
	placeholder?: string;
}

interface SchemaFieldsEditorProps {
	schemaFields: SchemaField[];
	metadata: Record<string, string>;
	updateMetadata: (key: string, value: string) => void;
}

export function SchemaFieldsEditor({
	schemaFields,
	metadata,
	updateMetadata,
}: SchemaFieldsEditorProps) {
	const { t } = useTranslation();
	const [showGeneratorFor, setShowGeneratorFor] = useState<string | null>(
		null,
	);
	const [showPasswordFor, setShowPasswordFor] = useState<
		Record<string, boolean>
	>({});

	// A wrapper component to cleanly use the hook per password field
	const PasswordField = ({
		field,
		pwdVal,
	}: {
		field: SchemaField;
		pwdVal: string;
	}) => {
		const { score, details } = usePasswordStrength(pwdVal);

		return (
			<div className="space-y-1">
				<div className="relative">
					<Input
						type={showPasswordFor[field.key] ? "text" : "password"}
						value={pwdVal}
						onChange={(e) =>
							updateMetadata(field.key, e.target.value)
						}
						autoComplete="new-password"
						className="bg-background rounded-xl border border-border font-mono pr-10"
					/>
					<Button
						variant="ghost"
						size="icon"
						type="button"
						onClick={() =>
							setShowPasswordFor((prev) => ({
								...prev,
								[field.key]: !prev[field.key],
							}))
						}
						className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
					>
						{showPasswordFor[field.key] ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Eye className="h-4 w-4" />
						)}
					</Button>
				</div>
				{pwdVal && (
					<div className="pt-1 flex items-center justify-between">
						<div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
							<div
								className={`h-full ${details.color} transition-all duration-300`}
								style={{
									width: `${score <= 1 ? 33 : score === 2 ? 66 : 100}%`,
								}}
							/>
						</div>
						<span
							className={`text-[10px] font-medium ml-2 ${details.textColor}`}
						>
							{t("tools.password_manager_strength_label")}{" "}
							{t(details.label)}
						</span>
					</div>
				)}
			</div>
		);
	};

	return (
		<>
			{schemaFields.map((field) => {
				const val = metadata[field.key] || "";

				return (
					<div key={field.key} className="space-y-1.5">
						<div className="flex items-center justify-between">
							<Label className="text-xs text-muted-foreground">
								{field.placeholder
									? t(field.placeholder) || field.label
									: field.label}
							</Label>
							{field.type === "password" && (
								<Drawer
									direction="right"
									open={showGeneratorFor === field.key}
									onOpenChange={(open) =>
										setShowGeneratorFor(
											open ? field.key : null,
										)
									}
								>
									<DrawerTrigger asChild>
										<Button
											variant="link"
											type="button"
											className="h-auto p-0 text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-medium"
										>
											<RefreshCw className="h-3 w-3" />
											{t(
												"tools.password_manager_generate",
											)}
										</Button>
									</DrawerTrigger>
									<DrawerContent className="p-4 bg-background h-full">
										<div className="mx-auto w-full max-w-sm h-full overflow-y-auto no-scrollbar">
											<DrawerHeader className="px-0">
												<DrawerTitle>
													{t(
														"tools.password_generator_title",
													)}
												</DrawerTitle>
											</DrawerHeader>
											<div className="mt-2">
												<PasswordGenerator
													onGenerate={(pwd) => {
														updateMetadata(
															field.key,
															pwd,
														);
														setShowGeneratorFor(
															null,
														);
													}}
													onClose={() =>
														setShowGeneratorFor(
															null,
														)
													}
												/>
											</div>
										</div>
									</DrawerContent>
								</Drawer>
							)}
						</div>

						{field.type === "multiline" ? (
							<Textarea
								value={val}
								onChange={(e) =>
									updateMetadata(field.key, e.target.value)
								}
								className="bg-background rounded-xl border border-border min-h-25 font-mono text-sm"
							/>
						) : field.type === "password" ? (
							<PasswordField field={field} pwdVal={val} />
						) : (
							<Input
								type={field.type}
								value={val}
								onChange={(e) =>
									updateMetadata(field.key, e.target.value)
								}
								autoComplete="off"
								className="bg-background rounded-xl border border-border"
							/>
						)}
					</div>
				);
			})}
		</>
	);
}
