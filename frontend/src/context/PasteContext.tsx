import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useRef,
	useEffect,
} from "react";
import { CONFIG } from "@/configurations";
import { getDraft, saveDraft } from "@/lib/utils";
import { useFileUpload, type UploadState } from "@/hooks/use-file-upload";
import type {
	Visibility,
	EditPermission,
	PublicRole,
	ShareRole,
	ContentMode,
} from "@/types";

interface PasteContextType {
	// State
	visibility: Visibility;
	editPermission: EditPermission;
	allowedUsers: string[];
	shareList: { email: string; role: ShareRole }[];
	publicRole: PublicRole;
	allowComments: boolean;
	expiresTime: string;
	contentType: ContentMode;
	language: string;
	textValue: string;
	password: string;
	customId: string;
	idTypeTab: "system" | "dynamic";
	isSubmitting: boolean;

	// File Upload State
	isUploading: boolean;
	uploadProgress: number;
	uploadError: string | null;
	fileUrl: string | null;
	fileName: string | null;
	fileSize: number | null;
	fileMimeType: string | null;

	// Setters
	setVisibility: (v: Visibility) => void;
	setEditPermission: (v: EditPermission) => void;
	setAllowedUsers: (v: string[]) => void;
	setShareList: (v: { email: string; role: ShareRole }[]) => void;
	setPublicRole: (v: PublicRole) => void;
	setAllowComments: (v: boolean) => void;
	setExpiresTime: (v: string) => void;
	setContentType: (v: ContentMode) => void;
	setLanguage: (v: string) => void;
	setTextValue: (v: string) => void;
	setPassword: (v: string) => void;
	setCustomId: (v: string) => void;
	setIdTypeTab: (v: "system" | "dynamic") => void;
	setIsSubmitting: (v: boolean) => void;

	// File Upload Actions
	uploadFile: (file: File) => Promise<UploadState>;
	setFileUpload: (file: File) => void;
	resetFileUpload: () => void;

	// Complex actions
	onContentTypeChange: (newMode: ContentMode) => void;
	resetPaste: () => void;
}

const PasteContext = createContext<PasteContextType | undefined>(undefined);

export const PasteProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	// State Initialization
	const [visibility, setVisibility] = useState<Visibility>(
		CONFIG.DEFAULTS.VISIBILITY,
	);
	const [editPermission, setEditPermission] = useState<EditPermission>(
		CONFIG.DEFAULTS.EDIT_PERMISSION,
	);
	const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
	const [shareList, setShareList] = useState<
		{ email: string; role: ShareRole }[]
	>([]);
	const [publicRole, setPublicRole] = useState<PublicRole>(
		CONFIG.DEFAULTS.PUBLIC_ROLE,
	);
	const [allowComments, setAllowComments] = useState(false);
	const [expiresTime, setExpiresTime] = useState(CONFIG.DEFAULTS.EXPIRY);
	const [contentType, setContentType] = useState<ContentMode>(
		CONFIG.DEFAULTS.CONTENT_MODE,
	);
	const [language, setLanguageState] = useState(CONFIG.DEFAULTS.LANGUAGE);
	const [password, setPassword] = useState("");
	const [customId, setCustomId] = useState("");
	const [idTypeTab, setIdTypeTab] = useState<"system" | "dynamic">("system");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		isUploading,
		progress: uploadProgress,
		error: uploadError,
		fileUrl,
		fileName,
		fileSize,
		fileMimeType,
		uploadFile,
		setFile: setFileUpload,
		reset: resetFileUpload,
	} = useFileUpload();

	const valueRef = useRef("");
	const [textValue, setTextValueState] = useState(() => {
		const draft = getDraft(CONFIG.DEFAULTS.CONTENT_MODE) || "";
		valueRef.current = draft;
		return draft;
	});

	// Persistence for text draft
	useEffect(() => {
		const timer = setTimeout(() => {
			saveDraft(contentType, textValue);
		}, 1000);
		return () => clearTimeout(timer);
	}, [textValue, contentType]);

	const setTextValue = useCallback((val: string) => {
		setTextValueState(val);
		valueRef.current = val;
	}, []);

	const setLanguage = useCallback(
		(newLang: string) => {
			setLanguageState(newLang);
			if (newLang !== "text" && contentType === "text") {
				setContentType("code");
			} else if (newLang === "text" && contentType === "code") {
				setContentType("text");
			}
		},
		[contentType],
	);

	const onContentTypeChange = useCallback(
		(newMode: ContentMode) => {
			if (newMode === contentType) return;

			if (newMode === "text") {
				setLanguageState("text");
			} else if (newMode === "code") {
				setLanguageState(
					CONFIG.DEFAULTS.LANGUAGE === "text"
						? "javascript"
						: CONFIG.DEFAULTS.LANGUAGE,
				);
			}

			// Capture current value before switching
			const currentVal = valueRef.current;
			saveDraft(contentType, currentVal);

			// Special Case: Priority migration to 'draw' if current value is already a valid drawing
			let migrationApplied = false;
			if (newMode === "draw") {
				try {
					const parsed = JSON.parse(currentVal);
					if (
						parsed &&
						Array.isArray(parsed.elements) &&
						(parsed.appState || parsed.type === "excalidraw")
					) {
						migrationApplied = true;
						// Keep currentVal (textValue) as it's already a valid drawing
					}
				} catch {
					migrationApplied = false;
				}
			}

			if (!migrationApplied) {
				const draft = getDraft(newMode);
				if (draft !== null) {
					setTextValue(draft);
				} else if (newMode === "draw") {
					const emptyDraw = JSON.stringify({
						elements: [],
						appState: {},
					});
					setTextValue(emptyDraw);
				} else {
					setTextValue("");
				}
			}
			setContentType(newMode);
		},
		[contentType, setTextValue],
	);

	const resetPaste = useCallback(() => {
		setVisibility(CONFIG.DEFAULTS.VISIBILITY);
		setEditPermission(CONFIG.DEFAULTS.EDIT_PERMISSION);
		setAllowedUsers([]);
		setShareList([]);
		setPublicRole(CONFIG.DEFAULTS.PUBLIC_ROLE);
		setAllowComments(false);
		setExpiresTime(CONFIG.DEFAULTS.EXPIRY);
		setContentType(CONFIG.DEFAULTS.CONTENT_MODE);
		setLanguageState(CONFIG.DEFAULTS.LANGUAGE);
		setTextValue("");
		setPassword("");
		setCustomId("");
		setIdTypeTab("system");
	}, [setTextValue]);

	const value = React.useMemo(
		() => ({
			visibility,
			setVisibility,
			editPermission,
			setEditPermission,
			allowedUsers,
			setAllowedUsers,
			shareList,
			setShareList,
			publicRole,
			setPublicRole,
			allowComments,
			setAllowComments,
			expiresTime,
			setExpiresTime,
			contentType,
			setContentType,
			language,
			setLanguage,
			textValue,
			setTextValue,
			password,
			setPassword,
			customId,
			setCustomId,
			idTypeTab,
			setIdTypeTab,
			isSubmitting,
			setIsSubmitting,
			isUploading,
			uploadProgress,
			uploadError,
			fileUrl,
			fileName,
			fileSize,
			fileMimeType,
			uploadFile,
			setFileUpload,
			resetFileUpload,
			onContentTypeChange,
			resetPaste,
		}),
		[
			visibility,
			setVisibility,
			editPermission,
			setEditPermission,
			allowedUsers,
			setAllowedUsers,
			shareList,
			setShareList,
			publicRole,
			setPublicRole,
			allowComments,
			setAllowComments,
			expiresTime,
			setExpiresTime,
			contentType,
			setContentType,
			language,
			setLanguage,
			textValue,
			setTextValue,
			password,
			setPassword,
			customId,
			setCustomId,
			idTypeTab,
			setIdTypeTab,
			isSubmitting,
			setIsSubmitting,
			isUploading,
			uploadProgress,
			uploadError,
			fileUrl,
			fileName,
			fileSize,
			fileMimeType,
			uploadFile,
			setFileUpload,
			resetFileUpload,
			onContentTypeChange,
			resetPaste,
		],
	);

	return (
		<PasteContext.Provider value={value}>{children}</PasteContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePaste = () => {
	const context = useContext(PasteContext);
	if (!context) {
		throw new Error("usePaste must be used within a PasteProvider");
	}
	return context;
};
