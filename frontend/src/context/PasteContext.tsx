import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useRef,
	useEffect,
} from "react";
import { CONFIG } from "@/configurations";
import { getDraft, saveDraft, isSnipitDrawing } from "@/utils";
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
	labels: string[];
	setLabels: (v: string[]) => void;

	// File Upload Actions
	uploadFile: (file: File) => Promise<UploadState>;
	setFileUpload: (file: File | null) => void;
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
		CONFIG.defaults.visibility,
	);
	const [editPermission, setEditPermission] = useState<EditPermission>(
		CONFIG.defaults.editPermission,
	);
	const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
	const [shareList, setShareList] = useState<
		{ email: string; role: ShareRole }[]
	>([]);
	const [publicRole, setPublicRole] = useState<PublicRole>(
		CONFIG.defaults.publicRole,
	);
	const [allowComments, setAllowComments] = useState(false);
	const [expiresTime, setExpiresTime] = useState(CONFIG.defaults.expiry);
	const [contentType, setContentType] = useState<ContentMode>(
		CONFIG.defaults.contentMode,
	);
	const [language, setLanguageState] = useState(CONFIG.defaults.language);
	const [password, setPassword] = useState("");
	const [customId, setCustomId] = useState("");
	const [idTypeTab, setIdTypeTab] = useState<"system" | "dynamic">("system");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [labels, setLabels] = useState<string[]>([]);

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
		const draft = getDraft(CONFIG.defaults.contentMode) || "";
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
					CONFIG.defaults.language === "text"
						? "javascript"
						: CONFIG.defaults.language,
				);
			}

			// Capture current value before switching
			const currentVal = valueRef.current;
			saveDraft(contentType, currentVal);

			// Special Case: Priority migration to 'draw' if current value is already a valid drawing
			let migrationApplied = false;
			if (newMode === "draw") {
				if (isSnipitDrawing(currentVal)) {
					migrationApplied = true;
					// Keep currentVal (textValue) as it's already a valid drawing
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
		setVisibility(CONFIG.defaults.visibility);
		setEditPermission(CONFIG.defaults.editPermission);
		setAllowedUsers([]);
		setShareList([]);
		setPublicRole(CONFIG.defaults.publicRole);
		setAllowComments(false);
		setExpiresTime(CONFIG.defaults.expiry);
		setContentType(CONFIG.defaults.contentMode);
		setLanguageState(CONFIG.defaults.language);
		setTextValue("");
		setPassword("");
		setCustomId("");
		setIdTypeTab("system");
		setLabels([]);
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
			labels,
			setLabels,
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
			labels,
			setLabels,
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
