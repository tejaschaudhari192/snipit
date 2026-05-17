import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { User } from "@/types";
import { IdTypeTabs } from "./paste-dialog/id-type-tabs";
import { BasicSettings } from "./paste-dialog/basic-settings";
import { VisibilitySelector } from "@/components/common/access-control/visibility-selector";
import { CollaboratorsManager } from "@/components/common/access-control/collaborators-manager";
import { usePaste } from "@/context/PasteContext";

interface PasteDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	dialogError: string;
	user: User | null;
	onSubmit: () => void;
	uploadProgress?: number;
}

export const PasteDialog = ({
	isOpen,
	onOpenChange,
	dialogError,
	user,
	onSubmit,
	uploadProgress = 0,
}: PasteDialogProps) => {
	const {
		idTypeTab,
		setIdTypeTab,
		customId,
		setCustomId,
		visibility,
		setVisibility,
		password,
		setPassword,
		setEditPermission,
		collaborators,
		setCollaborators,
		allowedUsers,
		setAllowedUsers,
		publicRole,
		setPublicRole,
		allowComments,
		setAllowComments,
		contentType,
		isSubmitting,
		isUploading,
	} = usePaste();
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [isPasswordEnabled, setIsPasswordEnabled] = useState(!!password);

	if (isOpen && !isPasswordEnabled && password) {
		setIsPasswordEnabled(true);
	}

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md gap-0 border border-border/50 bg-background/60 backdrop-blur-2xl shadow-2xl rounded-2xl ring-1 ring-white/5 overflow-hidden">
				<DialogHeader className="mb-4">
					<DialogTitle>{t("home.paste_button")}</DialogTitle>
				</DialogHeader>

				<IdTypeTabs
					idTypeTab={idTypeTab}
					setIdTypeTab={setIdTypeTab}
					customId={customId}
					setCustomId={setCustomId}
					onSubmit={onSubmit}
				/>

				<div className="space-y-4 mb-6">
					<BasicSettings
						isPasswordEnabled={isPasswordEnabled}
						setIsPasswordEnabled={setIsPasswordEnabled}
						password={password}
						setPassword={setPassword}
						allowComments={allowComments}
						setAllowComments={setAllowComments}
					/>

					{!user ? (
						<div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
							<div className="flex items-center gap-2 text-primary font-semibold">
								<LogIn className="h-4 w-4" />
								<span>{t("common.auth_required")}</span>
							</div>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{t("common.auth_required_desc")}
							</p>
							<div className="flex gap-2 pt-1">
								<Button
									size="sm"
									variant="outline"
									className="h-8 text-xs font-bold"
									onClick={() => navigate("/login")}
								>
									{t("header.login")}
								</Button>
								<Button
									size="sm"
									className="h-8 text-xs font-bold"
									onClick={() => navigate("/signup")}
								>
									{t("header.signup")}
								</Button>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							<VisibilitySelector
								visibility={visibility}
								setVisibility={setVisibility}
								publicRole={publicRole}
								setPublicRole={setPublicRole}
								setEditPermission={setEditPermission}
							/>

							<CollaboratorsManager
								collaborators={collaborators}
								setCollaborators={setCollaborators}
								allowedUsers={allowedUsers}
								setAllowedUsers={setAllowedUsers}
							/>
						</div>
					)}
				</div>

				{dialogError && (
					<div className="animate-in fade-in slide-in-from-top-2 duration-300 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-500 flex items-start gap-2 theme-error-box">
						<div className="mt-0.5">⚠️</div>
						<p>{dialogError}</p>
					</div>
				)}

				<DialogFooter className="sm:justify-between gap-2">
					<Button variant="ghost" onClick={() => onOpenChange(false)}>
						{t("home.dynamic_id_dialog.cancel")}
					</Button>
					<Button
						onClick={onSubmit}
						disabled={
							isSubmitting ||
							(idTypeTab === "dynamic" && !customId.trim()) ||
							(!user && visibility !== "public")
						}
						className="px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold"
					>
						{isSubmitting
							? contentType === "file" &&
								isUploading &&
								uploadProgress < 100
								? t("home.file_uploading")
								: t("common.submitting")
							: t("home.dynamic_id_dialog.submit")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
