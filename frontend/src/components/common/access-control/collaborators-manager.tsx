import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MultiEmailInput } from "@/components/ui/multi-email-input";
import { Button } from "@/components/ui/button";
import { Users, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export type Role = "viewer" | "editor" | "admin" | "commenter";

interface ShareItem {
	email: string;
	role: Role;
}

interface CollaboratorsManagerProps {
	shareList: ShareItem[];
	setShareList: (v: ShareItem[]) => void;
	allowedUsers: string[];
	setAllowedUsers: (v: string[]) => void;
	disabled?: boolean;
}

export const CollaboratorsManager = ({
	shareList,
	setShareList,
	allowedUsers,
	setAllowedUsers,
	disabled = false,
}: CollaboratorsManagerProps) => {
	const { t } = useTranslation();
	const [pendingEmails, setPendingEmails] = useState<string[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [pendingRole, setPendingRole] = useState<Role>("editor");

	const handleAddPeople = () => {
		const emailsToAdd = [...pendingEmails];

		if (inputValue.trim()) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (emailRegex.test(inputValue.trim())) {
				emailsToAdd.push(inputValue.trim());
				setInputValue(""); // clear it
			}
		}

		if (emailsToAdd.length === 0) return;

		const newShareItems = emailsToAdd.map((email) => ({
			email,
			role: pendingRole,
		}));

		const uniqueItems = newShareItems.filter(
			(newItem) =>
				!shareList.some((existing) => existing.email === newItem.email),
		);

		setShareList([...shareList, ...uniqueItems]);
		setPendingEmails([]);
		setAllowedUsers([...allowedUsers, ...uniqueItems.map((i) => i.email)]);
	};

	const handleRemovePerson = (emailToRemove: string) => {
		setShareList(shareList.filter((i) => i.email !== emailToRemove));
		setAllowedUsers(allowedUsers.filter((e) => e !== emailToRemove));
	};

	const handleUpdateRole = (email: string, newRole: Role) => {
		setShareList(
			shareList.map((item) =>
				item.email === email ? { ...item, role: newRole } : item,
			),
		);
	};

	return (
		<div className="space-y-3">
			<Label className="flex items-center gap-2 text-sm font-medium">
				<Users className="h-4 w-4 text-muted-foreground" />
				{t("common.share_with_people", "Share with people")}
			</Label>
			<div className="flex flex-col sm:flex-row gap-2 p-1">
				<div className="flex-1 min-w-0">
					<MultiEmailInput
						value={pendingEmails}
						onChange={setPendingEmails}
						inputValue={inputValue}
						onInputChange={setInputValue}
						placeholder={t(
							"common.add_people_placeholder",
							"Add people...",
						)}
						className="min-h-[44px] bg-background"
						isReadOnly={disabled}
					/>
				</div>
				<div className="flex gap-2 items-center">
					<Select
						value={pendingRole}
						onValueChange={(r: Role) => setPendingRole(r)}
						disabled={disabled}
					>
						<SelectTrigger className="flex-1 sm:w-[110px] h-[44px] bg-background border-input focus:ring-primary/20">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="viewer">
								{t("common.viewer", "Viewer")}
							</SelectItem>
							<SelectItem value="editor">
								{t("common.editor", "Editor")}
							</SelectItem>
							<SelectItem value="admin">
								{t("common.admin", "Admin")}
							</SelectItem>
							<SelectItem value="commenter">
								{t("common.commenter", "Commenter")}
							</SelectItem>
						</SelectContent>
					</Select>
					<Button
						onClick={handleAddPeople}
						disabled={
							disabled ||
							(pendingEmails.length === 0 &&
								!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
									inputValue.trim(),
								))
						}
						className="h-[44px] px-4 sm:px-6 min-w-[70px] sm:min-w-[80px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors border-none flex-1 sm:flex-none"
					>
						{t("common.add", "Add")}
					</Button>
				</div>
			</div>

			{shareList.length > 0 && (
				<div className="flex flex-col gap-2 mt-2 max-h-[150px] overflow-y-auto pr-1">
					<Label className="text-xs text-muted-foreground mt-2">
						{t("common.people_with_access", "People with access")}
					</Label>
					{shareList.map((item) => (
						<div
							key={item.email}
							className="flex flex-col min-[440px]:flex-row min-[440px]:items-center justify-between p-2.5 rounded-xl border bg-card/50 gap-3 shadow-sm"
						>
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
									onValueChange={(r: Role) =>
										handleUpdateRole(item.email, r)
									}
									disabled={disabled}
								>
									<SelectTrigger className="flex-1 min-[440px]:w-[100px] h-8 text-[11px] bg-background border-input/50">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="viewer">
											{t("common.viewer", "Viewer")}
										</SelectItem>
										<SelectItem value="editor">
											{t("common.editor", "Editor")}
										</SelectItem>
										<SelectItem value="admin">
											{t("common.admin", "Admin")}
										</SelectItem>
										<SelectItem value="commenter">
											{t("common.commenter", "Commenter")}
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
										{t("common.remove", "Remove")}
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
