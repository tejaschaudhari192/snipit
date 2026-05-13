import { useState } from "react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MultiEmailInput } from "@/components/ui/multi-email-input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ShareRole } from "@/types";
import { useApiHelpers } from "@/lib/api";
import { toast } from "sonner";

interface ShareItem {
	email: string;
	role: ShareRole;
}

interface CollaboratorsManagerProps {
	pasteId?: string;
	shareList: ShareItem[];
	setShareList: (v: ShareItem[]) => void;
	allowedUsers: string[];
	setAllowedUsers: (v: string[]) => void;
	disabled?: boolean;
}

export const CollaboratorsManager = ({
	pasteId,
	shareList,
	setShareList,
	allowedUsers,
	setAllowedUsers,
	disabled = false,
}: CollaboratorsManagerProps) => {
	const { t } = useTranslation();
	const apiHelpers = useApiHelpers();
	const [pendingEmails, setPendingEmails] = useState<string[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [pendingRole, setPendingRole] = useState<ShareRole>("editor");
	const [isUpdating, setIsUpdating] = useState(false);

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
			(email) => !shareList.some((existing) => existing.email === email),
		);

		if (uniqueEmails.length === 0) return;

		if (pasteId) {
			setIsUpdating(true);
			try {
				const updatePromises = uniqueEmails.map((email) =>
					apiHelpers.addCollaborator(pasteId, email, pendingRole),
				);
				const results = await Promise.all(updatePromises);
				setShareList([...shareList, ...(results as ShareItem[])]);
				setAllowedUsers([
					...allowedUsers,
					...results.map((i) => i.email),
				]);
				toast.success(t("messages.collaborators_added"));
			} catch {
				toast.error(t("messages.collaborators_failed"));
			} finally {
				setIsUpdating(false);
			}
		} else {
			const newShareItems = uniqueEmails.map((email) => ({
				email,
				role: pendingRole,
			}));
			setShareList([...shareList, ...newShareItems]);
			setAllowedUsers([
				...allowedUsers,
				...newShareItems.map((i) => i.email),
			]);
		}

		setPendingEmails([]);
	};

	const handleRemovePerson = async (emailToRemove: string) => {
		if (pasteId) {
			setIsUpdating(true);
			try {
				await apiHelpers.removeCollaborator(pasteId, emailToRemove);
				setShareList(
					shareList.filter((i) => i.email !== emailToRemove),
				);
				setAllowedUsers(
					allowedUsers.filter((e) => e !== emailToRemove),
				);
				toast.success(t("messages.collaborator_removed"));
			} catch {
				toast.error(t("messages.collaborator_remove_failed"));
			} finally {
				setIsUpdating(false);
			}
		} else {
			setShareList(shareList.filter((i) => i.email !== emailToRemove));
			setAllowedUsers(allowedUsers.filter((e) => e !== emailToRemove));
		}
	};

	const handleUpdateRole = async (email: string, newRole: ShareRole) => {
		if (pasteId) {
			setIsUpdating(true);
			try {
				const result = await apiHelpers.addCollaborator(
					pasteId,
					email,
					newRole,
				);
				setShareList(
					shareList.map((item) =>
						item.email === email
							? { ...item, role: result.role as ShareRole }
							: item,
					),
				);
				toast.success(t("messages.collaborator_updated"));
			} catch {
				toast.error(t("messages.collaborator_update_failed"));
			} finally {
				setIsUpdating(false);
			}
		} else {
			setShareList(
				shareList.map((item) =>
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
						placeholder={t("common.add_people_placeholder")}
						className="min-h-[36px] border-none bg-transparent shadow-none focus-within:ring-0 focus-within:ring-offset-0 text-[13px] px-2 py-0"
						isReadOnly={disabled || isUpdating}
					/>
				</div>
				<div className="flex gap-1 items-center px-1 sm:pr-1 w-full sm:w-auto justify-end border-t sm:border-t-0 sm:border-l border-border/10 pt-2 sm:pt-0 pl-0 sm:pl-2">
					<Select
						value={pendingRole}
						onValueChange={(r: ShareRole) => setPendingRole(r)}
						disabled={disabled || isUpdating}
					>
						<SelectTrigger className="w-[100px] h-8 text-xs font-medium border-none bg-transparent hover:bg-muted/50 focus:ring-0 shadow-none">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="viewer">
								{t("common.viewer")}
							</SelectItem>
							<SelectItem value="editor">
								{t("common.editor")}
							</SelectItem>
							<SelectItem value="admin">
								{t("common.admin")}
							</SelectItem>
							<SelectItem value="commenter">
								{t("common.commenter")}
							</SelectItem>
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
						className="h-8 px-4 font-bold shadow-md hover:shadow-lg transition-all"
					>
						{isUpdating ? (
							<span className="animate-pulse">...</span>
						) : (
							t("common.add")
						)}
					</Button>
				</div>
			</div>

			{shareList.length > 0 && (
				<div className="flex flex-col gap-2 mt-2 max-h-[150px] overflow-y-auto pr-1">
					<p className="text-[11px] font-semibold text-muted-foreground tracking-wide mt-3 mb-1 px-1">
						{t("common.people_with_access")}
					</p>
					{shareList.map((item) => (
						<div
							key={item.email}
							className="relative flex flex-col min-[440px]:flex-row min-[440px]:items-center justify-between p-2.5 rounded-xl border bg-card/50 gap-3 shadow-sm overflow-hidden"
						>
							<div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/40 to-transparent" />
							<div className="flex items-center gap-2 overflow-hidden flex-1">
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
								<Select
									value={item.role}
									onValueChange={(r: ShareRole) =>
										handleUpdateRole(item.email, r)
									}
									disabled={disabled}
								>
									<SelectTrigger className="flex-1 min-[440px]:w-[100px] h-8 text-[11px] bg-background border-input/50">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="viewer">
											{t("common.viewer")}
										</SelectItem>
										<SelectItem value="editor">
											{t("common.editor")}
										</SelectItem>
										<SelectItem value="admin">
											{t("common.admin")}
										</SelectItem>
										<SelectItem value="commenter">
											{t("common.commenter")}
										</SelectItem>
									</SelectContent>
								</Select>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
									onClick={() =>
										handleRemovePerson(item.email)
									}
									disabled={disabled}
								>
									<span className="sr-only">
										{t("common.remove")}
									</span>
									<X width="14" height="14" />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
