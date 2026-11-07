import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { lazy, Suspense } from "react";
const PasswordGenerator = lazy(
	() => import("@/tools/password-manager/components/password-generator"),
);
import {
	Eye,
	EyeOff,
	Sparkles,
	User,
	Mail,
	Lock,
	Globe,
	CreditCard,
	Key,
	Hash,
	Calendar,
	Phone,
} from "lucide-react";
import { usePasswordStrength } from "@/hooks/use-password-strength";
import { Skeleton } from "@/components/ui/skeleton";

export interface SchemaField {
	key: string;
	label: string;
	type:
		| "text"
		| "password"
		| "email"
		| "multiline"
		| "url"
		| "number"
		| "file"
		| "tel";
	placeholder?: string;
}

interface SchemaFieldsEditorProps {
	schemaFields: SchemaField[];
	metadata: Record<string, string>;
	updateMetadata: (key: string, value: string) => void;
}

function getFieldIcon(field: SchemaField) {
	if (
		field.type === "password" ||
		field.key.toLowerCase().includes("password")
	)
		return Lock;
	if (field.type === "email" || field.key.toLowerCase().includes("email"))
		return Mail;
	if (
		field.type === "url" ||
		field.key.toLowerCase().includes("url") ||
		field.key.toLowerCase().includes("website")
	)
		return Globe;
	if (
		field.key.toLowerCase().includes("user") ||
		field.key.toLowerCase().includes("login") ||
		field.key.toLowerCase().includes("name")
	)
		return User;
	if (
		field.key.toLowerCase().includes("card") ||
		field.key.toLowerCase().includes("holder")
	)
		return CreditCard;
	if (
		field.key.toLowerCase().includes("key") ||
		field.key.toLowerCase().includes("secret") ||
		field.key.toLowerCase().includes("token")
	)
		return Key;
	if (
		field.type === "number" ||
		field.key.toLowerCase().includes("pin") ||
		field.key.toLowerCase().includes("cvv")
	)
		return Hash;
	if (
		field.key.toLowerCase().includes("date") ||
		field.key.toLowerCase().includes("exp")
	)
		return Calendar;
	if (field.type === "tel") return Phone;
	return null;
}

interface PasswordFieldProps {
	placeholder?: string;
	pwdVal: string;
	showPassword: boolean;
	onToggleShowPassword: () => void;
	onUpdate: (val: string) => void;
	onOpenGenerator: () => void;
}

function PasswordField({
	placeholder,
	pwdVal,
	showPassword,
	onToggleShowPassword,
	onUpdate,
	onOpenGenerator,
}: PasswordFieldProps) {
	const { t } = useTranslation();
	const { score } = usePasswordStrength(pwdVal);

	// 4 segmented score bars matching the image
	// 0: empty, 1: red, 2: orange, 3: yellow, 4: green
	const segments = [1, 2, 3, 4];
	const getSegmentColor = (segmentIndex: number) => {
		if (!pwdVal || score < segmentIndex) return "bg-muted/70";
		if (score === 1) return "bg-rose-500";
		if (score === 2) return "bg-orange-500";
		if (score === 3) return "bg-amber-500";
		return "bg-emerald-500";
	};

	return (
		<div className="space-y-1.5">
			<div className="relative flex items-center bg-background border border-border/80 rounded-xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all overflow-hidden h-10">
				<Input
					type={showPassword ? "text" : "password"}
					value={pwdVal}
					onChange={(e) => onUpdate(e.target.value)}
					placeholder={placeholder || "Secure Password"}
					autoComplete="new-password"
					className="bg-transparent border-0 font-mono text-sm h-full px-3.5 focus-visible:ring-0 shadow-none flex-1"
				/>

				<div className="flex items-center gap-1 pr-1.5 shrink-0">
					<button
						type="button"
						tabIndex={-1}
						onMouseDown={(e) => e.preventDefault()}
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onToggleShowPassword();
						}}
						className="p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-lg flex items-center justify-center"
						aria-label={
							showPassword ? "Hide password" : "Show password"
						}
					>
						{showPassword ? (
							<EyeOff className="h-4 w-4 shrink-0" />
						) : (
							<Eye className="h-4 w-4 shrink-0" />
						)}
					</button>

					<div className="h-4 w-[1px] bg-border mx-0.5" />

					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={onOpenGenerator}
						className="h-7 px-2.5 text-xs text-primary font-medium hover:bg-primary/10 hover:text-primary rounded-lg transition-colors gap-1.5"
					>
						<Sparkles className="h-3.5 w-3.5" />
						{t("tools.password_manager.generate", {
							defaultValue: "Generate Password",
						})}
					</Button>
				</div>
			</div>

			{/* 4-segment strength bar under input */}
			{pwdVal && (
				<div className="grid grid-cols-4 gap-1.5 px-0.5 pt-0.5">
					{segments.map((seg) => (
						<div
							key={seg}
							className={`h-1 rounded-full transition-colors duration-300 ${getSegmentColor(seg)}`}
						/>
					))}
				</div>
			)}
		</div>
	);
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

	// Filter out file fields and partition
	const activeFields = schemaFields.filter((f) => f.type !== "file");

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{activeFields.map((field) => {
					const val = metadata[field.key] || "";
					const Icon = getFieldIcon(field);
					const isPassword = field.type === "password";
					const isMultiline = field.type === "multiline";

					return (
						<div
							key={field.key}
							className={`space-y-1.5 ${isMultiline ? "md:col-span-2" : ""}`}
						>
							<div className="flex items-center justify-between">
								<Label className="text-xs font-medium text-foreground/80">
									{field.placeholder
										? t(field.placeholder) || t(field.label)
										: t(field.label)}
								</Label>
							</div>

							{isPassword ? (
								<>
									<PasswordField
										placeholder={
											field.placeholder
												? t(field.placeholder)
												: undefined
										}
										pwdVal={val}
										showPassword={
											!!showPasswordFor[field.key]
										}
										onToggleShowPassword={() =>
											setShowPasswordFor((prev) => ({
												...prev,
												[field.key]: !prev[field.key],
											}))
										}
										onUpdate={(newVal) =>
											updateMetadata(field.key, newVal)
										}
										onOpenGenerator={() =>
											setShowGeneratorFor(field.key)
										}
									/>

									<Drawer
										swipeDirection="right"
										open={showGeneratorFor === field.key}
										onOpenChange={(open) =>
											setShowGeneratorFor(
												open ? field.key : null,
											)
										}
									>
										<DrawerContent className="max-w-md mx-auto">
											<div className="p-4">
												<DrawerHeader className="p-0 mb-4">
													<DrawerTitle>
														{t(
															"tools.password_generator.title",
															{
																defaultValue:
																	"Generate Password",
															},
														)}
													</DrawerTitle>
												</DrawerHeader>
												<Suspense
													fallback={
														<div className="p-4 space-y-4 animate-pulse">
															<Skeleton className="h-10 w-full rounded-xl" />
															<Skeleton className="h-4 w-3/4 rounded-md" />
														</div>
													}
												>
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
												</Suspense>
											</div>
										</DrawerContent>
									</Drawer>
								</>
							) : (
								<div className="relative flex items-center bg-background border border-border/80 rounded-xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all overflow-hidden h-10">
									{Icon && (
										<div className="pl-3.5 pr-1 text-muted-foreground/70 shrink-0 flex items-center pointer-events-none">
											<Icon className="h-4 w-4" />
										</div>
									)}
									<Input
										type={field.type}
										value={val}
										onChange={(e) =>
											updateMetadata(
												field.key,
												e.target.value,
											)
										}
										placeholder={
											field.placeholder
												? t(field.placeholder)
												: field.label
													? t(field.label)
													: ""
										}
										autoComplete="off"
										className="bg-transparent border-0 text-sm h-full px-2.5 focus-visible:ring-0 shadow-none flex-1"
									/>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</>
	);
}
