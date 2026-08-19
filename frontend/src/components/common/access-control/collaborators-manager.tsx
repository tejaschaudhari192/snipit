import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MultiEmailInput } from "@/components/common/multi-email-input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROLE_OPTIONS } from "@/constants";
import { OptionDisplay } from "@/components/common/option-display";
import { cn } from "@/utils";
import type { ShareRole } from "@/types";
import { addCollaborator, removeCollaborator } from "@/lib/api/collaborators";
import { toast } from "@/components/ui/toast";
import { SelectSkeleton, ButtonSkeleton } from "@/components/common/skeletons";

interface ShareItem {
	email: string;
	role: ShareRole;
}

interface CollaboratorsManagerProps {
	pasteId?: string;
	collaborators: ShareItem[];
	setCollaborators: (v: ShareItem[]) => void;
	allowedUsers: string[];
	setAllowedUsers: (v: string[]) => void;
	disabled?: boolean;
	compact?: boolean;
}

export const CollaboratorsManager = ({
	pasteId,
	collaborators,
	setCollaborators,
	allowedUsers,
	setAllowedUsers,
	disabled = false,
	compact = false,
}: CollaboratorsManagerProps) => {
	const { t } = useTranslation();

	const [pendingEmails, setPendingEmails] = useState<string[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [pendingRole, setPendingRole] = useState<ShareRole>("editor");
	const [isUpdating, setIsUpdating] = useState(false);
	const [updatingEmails, setUpdatingEmails] = useState<string[]>([]);

	const handleAddPeople = async () => {
		const emailsToAdd = [...pendingEmails];

		if (inputValue.trim()) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (emailRegex.test(inputValue.trim())) {
				emailsToAdd.push(inputValue.trim());
				setInputValue(""); // clear it
			}
		}

		if (emailsToAdd.length === 0) return;

		const uniqueEmails = emailsToAdd.filter(
			(email) =>
				!collaborators.some((existing) => existing.email === email),
		);

		if (uniqueEmails.length === 0) return;

		if (pasteId) {
			setIsUpdating(true);
			try {
				const updatePromises = uniqueEmails.map((email) =>
					addCollaborator(pasteId, email, pendingRole),
				);
				const results = await Promise.all(updatePromises);
				setCollaborators([
					...collaborators,
					...(results as ShareItem[]),
				]);
				setAllowedUsers([
					...allowedUsers,
					...results.map((i) => i.email),
				]);
				toast.add({
					title: t("messages.success.collaborators_added"),
					type: "success",
				});
			} catch {
				toast.add({
					title: t("messages.error.collaborators_failed"),
					type: "error",
				});
			} finally {
				setIsUpdating(false);
			}
		} else {
			const newShareItems = uniqueEmails.map((email) => ({
				email,
				role: pendingRole,
			}));
			setCollaborators([...collaborators, ...newShareItems]);
			setAllowedUsers([
				...allowedUsers,
				...newShareItems.map((i) => i.email),
			]);
		}

		setPendingEmails([]);
	};

	const handleRemovePerson = async (emailToRemove: string) => {
		if (pasteId) {
			setUpdatingEmails((prev) => [...prev, emailToRemove]);
			try {
				await removeCollaborator(pasteId, emailToRemove);
				setCollaborators(
					collaborators.filter((i) => i.email !== emailToRemove),
				);
				setAllowedUsers(
					allowedUsers.filter((e) => e !== emailToRemove),
				);
				toast.add({
					title: t("messages.success.collaborator_removed"),
					type: "success",
				});
			} catch {
				toast.add({
					title: t("messages.error.collaborator_remove_failed"),
					type: "error",
				});
			} finally {
				setUpdatingEmails((prev) =>
					prev.filter((e) => e !== emailToRemove),
				);
			}
		} else {
			setCollaborators(
				collaborators.filter((i) => i.email !== emailToRemove),
			);
			setAllowedUsers(allowedUsers.filter((e) => e !== emailToRemove));
		}
	};

	const handleUpdateRole = async (email: string, newRole: ShareRole) => {
		if (pasteId) {
			setUpdatingEmails((prev) => [...prev, email]);
			try {
				const result = await addCollaborator(pasteId, email, newRole);
				setCollaborators(
					collaborators.map((item) =>
						item.email === email
							? { ...item, role: result.role as ShareRole }
							: item,
					),
				);
				toast.add({
					title: t("messages.success.collaborator_updated"),
					type: "success",
				});
			} catch {
				toast.add({
					title: t("messages.error.collaborator_update_failed"),
					type: "error",
				});
			} finally {
				setUpdatingEmails((prev) => prev.filter((e) => e !== email));
			}
		} else {
			setCollaborators(
				collaborators.map((item) =>
					item.email === email ? { ...item, role: newRole } : item,
				),
			);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-col sm:flex-row items-center p-1.5 gap-2 rounded-xl border border-input/50 bg-card/40 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all shadow-sm">
				<div className="flex-1 min-w-0 w-full flex items-center">
					<MultiEmailInput
						value={pendingEmails}
						onChange={setPendingEmails}
						inputValue={inputValue}
						onInputChange={setInputValue}
						placeholder={t("common.access.add_people_placeholder")}
						className="min-h-9 border-none bg-transparent shadow-none focus-within:ring-0 focus-within:ring-offset-0 text-[13px] px-2 py-0"
						isReadOnly={disabled || isUpdating}
					/>
				</div>
				<div className="flex gap-1 items-center px-1 sm:pr-1 w-full sm:w-auto justify-end border-t sm:border-t-0 sm:border-l border-border/10 pt-2 sm:pt-0 pl-0 sm:pl-2">
					<Select
						value={pendingRole}
						onValueChange={(r) => {
							if (!r) return;
							return setPendingRole(r);
						}}
						disabled={disabled || isUpdating}
					>
						<SelectTrigger className="w-32 h-10 text-sm font-medium border-none bg-transparent hover:bg-muted/50 focus:ring-0 shadow-none">
							<SelectValue>
								{(() => {
									const opt = ROLE_OPTIONS.find(
										(o) => o.value === pendingRole,
									);
									return opt ? (
										<OptionDisplay
											icon={opt.icon}
											label={t(opt.labelKey)}
										/>
									) : null;
								})()}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{ROLE_OPTIONS.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									<OptionDisplay
										icon={opt.icon}
										label={t(opt.labelKey)}
									/>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						variant="default"
						size="sm"
						onClick={handleAddPeople}
						disabled={
							disabled ||
							isUpdating ||
							(pendingEmails.length === 0 &&
								!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
									inputValue.trim(),
								))
						}
						className="h-9 px-4 font-bold shadow-md hover:shadow-lg transition-all"
					>
						{isUpdating ? (
							<span className="animate-pulse">...</span>
						) : (
							t("common.actions.add")
						)}
					</Button>
				</div>
			</div>

			{collaborators.length > 0 && (
				<div
					className={cn(
						"flex flex-col gap-2 mt-2 overflow-y-auto pr-1",
						compact ? "max-h-30" : "max-h-37.5",
					)}
				>
					{!compact && (
						<p className="text-[11px] font-semibold text-muted-foreground tracking-wide mt-3 mb-1 px-1">
							{t("common.access.people_with_access")}
						</p>
					)}
					{collaborators.map((item) => (
						<div
							key={item.email}
							className={cn(
								"relative flex flex-col min-[440px]:flex-row min-[440px]:items-center justify-between p-2.5 rounded-xl border bg-card/50 gap-3 shadow-sm overflow-hidden transition-all duration-300",
								updatingEmails.includes(item.email) &&
									"border-primary/20 bg-muted/10",
							)}
						>
							<div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/40 to-transparent" />
							<div
								className={cn(
									"flex items-center gap-2 overflow-hidden flex-1",
									updatingEmails.includes(item.email) &&
										"opacity-60",
								)}
							>
								<div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 border border-primary/20">
									{item.email[0].toUpperCase()}
								</div>
								<span
									className="text-xs font-medium truncate"
									title={item.email}
								>
									{item.email}
								</span>
							</div>
							<div className="flex items-center gap-2 shrink-0 w-full min-[440px]:w-auto">
								{updatingEmails.includes(item.email) ? (
									<div className="flex items-center gap-2 h-8">
										{/* Shimmer Select trigger skeleton */}
										<SelectSkeleton className="flex-1 min-[440px]:w-25" />
										{/* Shimmer Delete icon button skeleton */}
										<ButtonSkeleton
											size="icon"
											className="h-8 w-8"
										/>
									</div>
								) : (
									<>
										<Select
											value={item.role}
											onValueChange={(r) => {
												if (!r) return;
												return handleUpdateRole(
													item.email,
													r,
												);
											}}
											disabled={
												disabled ||
												updatingEmails.length > 0
											}
										>
											<SelectTrigger className="flex-1 min-[440px]:w-32 h-10 bg-background border-input/50">
												<SelectValue>
													{(() => {
														const opt =
															ROLE_OPTIONS.find(
																(o) =>
																	o.value ===
																	item.role,
															);
														return opt ? (
															<OptionDisplay
																icon={opt.icon}
																label={t(
																	opt.labelKey,
																)}
															/>
														) : null;
													})()}
												</SelectValue>
											</SelectTrigger>
											<SelectContent>
												{ROLE_OPTIONS.map((opt) => (
													<SelectItem
														key={opt.value}
														value={opt.value}
													>
														<OptionDisplay
															icon={opt.icon}
															label={t(
																opt.labelKey,
															)}
														/>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
											onClick={() =>
												handleRemovePerson(item.email)
											}
											disabled={
												disabled ||
												updatingEmails.length > 0
											}
										>
											<span className="sr-only">
												{t("common.actions.remove")}
											</span>
											<X width="14" height="14" />
										</Button>
									</>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
