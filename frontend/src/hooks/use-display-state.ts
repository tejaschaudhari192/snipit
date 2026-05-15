import { useState, useCallback } from "react";
import { CONFIG } from "@/configurations";
import type {
	PasteData,
	ContentMode,
	Visibility,
	EditPermission,
	PublicRole,
	ShareRole,
} from "@/types";

export interface ShareEntry {
	email: string;
	role: ShareRole;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export const useDisplayState = () => {
	const [isEdit, setIsEdit] = useState(false);
	const [paste, setPaste] = useState<PasteData>();
	const [updatedContent, setUpdatedContent] = useState<string>();
	const [loading, setLoading] = useState(true);
	const [contentType, setContentType] = useState<ContentMode>(
		CONFIG.defaults.contentMode,
	);
	const [visibility, setVisibility] = useState<Visibility>(
		CONFIG.defaults.visibility,
	);
	const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
	const [editPermission, setEditPermission] = useState<EditPermission>(
		CONFIG.defaults.editPermission,
	);
	const [shareList, setShareList] = useState<ShareEntry[]>([]);
	const [publicRole, setPublicRole] = useState<PublicRole>(
		CONFIG.defaults.publicRole,
	);
	const [allowComments, setAllowComments] = useState(false);
	const [customId, setCustomId] = useState("");
	const [passwordInput, setPasswordInput] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [editPassword, setEditPassword] = useState("");
	const [isPasswordEnabled, setIsPasswordEnabled] = useState(false);
	const [expiresTime, setExpiresTime] = useState(CONFIG.defaults.expiry);
	const [isCustomExpiryDialogOpen, setIsCustomExpiryDialogOpen] =
		useState(false);
	const [customExpiryDate, setCustomExpiryDate] = useState<Date | undefined>(
		new Date(Date.now() + 24 * 60 * 60 * 1000),
	);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
	const [isAutosave, setIsAutosave] = useState(true);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isWindowFullscreen, setIsWindowFullscreen] = useState(false);
	const [removedServerFileUrls, setRemovedServerFileUrls] = useState<
		Set<string>
	>(new Set());
	const [isTerminalOpen, setIsTerminalOpen] = useState(false);
	const [language, _setLanguage] = useState(CONFIG.defaults.language);
	const [idTypeTab, setIdTypeTab] = useState<
		"system" | "dynamic" | "semantic"
	>("system");
	const [isOptionsOpen, setIsOptionsOpen] = useState(false);

	const removeServerFile = useCallback((url: string) => {
		setRemovedServerFileUrls((prev) => {
			const next = new Set(prev);
			next.add(url);
			return next;
		});
	}, []);

	const updateAllFromData = useCallback((data: Partial<PasteData>) => {
		setPaste((prev) => (prev ? { ...prev, ...data } : (data as PasteData)));
		if (data.content !== undefined) setUpdatedContent(data.content);
		if (data.language !== undefined) _setLanguage(data.language);
		if (data.visibility !== undefined) setVisibility(data.visibility);
		if (data.allowedUsers !== undefined) setAllowedUsers(data.allowedUsers);
		if (data.editPermission !== undefined)
			setEditPermission(data.editPermission);
		if (data.shareList !== undefined) setShareList(data.shareList);
		if (data.publicRole !== undefined) setPublicRole(data.publicRole);
		if (data.allowComments !== undefined)
			setAllowComments(data.allowComments);
		if (data.expiresTime !== undefined) setExpiresTime(data.expiresTime);
		if (data.id !== undefined) setCustomId(data.id);
		if (
			data.password !== undefined ||
			data.isPasswordProtected !== undefined
		) {
			setIsPasswordEnabled(!!data.password || !!data.isPasswordProtected);
			setEditPassword("");
		}
		// Reset removed files when loading new data
		setRemovedServerFileUrls(new Set());
	}, []);

	return {
		isEdit,
		setIsEdit,
		paste,
		setPaste,
		updatedContent,
		setUpdatedContent,
		loading,
		setLoading,
		contentType,
		setContentType,
		visibility,
		setVisibility,
		allowedUsers,
		setAllowedUsers,
		editPermission,
		setEditPermission,
		shareList,
		setShareList,
		publicRole,
		setPublicRole,
		allowComments,
		setAllowComments,
		customId,
		setCustomId,
		passwordInput,
		setPasswordInput,
		passwordError,
		setPasswordError,
		editPassword,
		setEditPassword,
		isPasswordEnabled,
		setIsPasswordEnabled,
		expiresTime,
		setExpiresTime,
		isCustomExpiryDialogOpen,
		setIsCustomExpiryDialogOpen,
		customExpiryDate,
		setCustomExpiryDate,
		isDeleteDialogOpen,
		setIsDeleteDialogOpen,
		isSaving,
		setIsSaving,
		isVerifyingPassword,
		setIsVerifyingPassword,
		saveStatus,
		setSaveStatus,
		isAutosave,
		setIsAutosave,
		isFullscreen,
		setIsFullscreen,
		isWindowFullscreen,
		setIsWindowFullscreen,
		removedServerFileUrls,
		removeServerFile,
		isServerFileRemoved: removedServerFileUrls.size > 0,
		setIsServerFileRemoved: (removed: boolean) => {
			if (removed) {
				const allUrls = new Set<string>();
				if (paste?.files)
					paste.files.forEach((f) => allUrls.add(f.url));
				if (paste?.fileUrl) allUrls.add(paste.fileUrl);
				setRemovedServerFileUrls(allUrls);
			} else {
				setRemovedServerFileUrls(new Set());
			}
		},
		isTerminalOpen,
		setIsTerminalOpen,
		language,
		_setLanguage,
		idTypeTab,
		setIdTypeTab,
		isOptionsOpen,
		setIsOptionsOpen,
		updateAllFromData,
	};
};

export type DisplayState = ReturnType<typeof useDisplayState>;
