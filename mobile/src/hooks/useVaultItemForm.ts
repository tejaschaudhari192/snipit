import { useState, useCallback } from "react";
import { PasswordItem, CustomField } from "../core/vault-storage";

export function useVaultItemForm() {
	const [editingItem, setEditingItem] = useState<PasswordItem | null>(null);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [itemCategory, setItemCategory] = useState<PasswordItem["category"]>("login");
	const [itemFolderId, setItemFolderId] = useState<string | undefined>(undefined);
	const [newTitle, setNewTitle] = useState("");
	const [newUsername, setNewUsername] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [newUrl, setNewUrl] = useState("");
	const [newNotes, setNewNotes] = useState("");
	const [customFields, setCustomFields] = useState<CustomField[]>([]);
	const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);

	// Category-specific fields
	const [cardHolder, setCardHolder] = useState("");
	const [cardNumber, setCardNumber] = useState("");
	const [cardExp, setCardExp] = useState("");
	const [cardCvv, setCardCvv] = useState("");
	const [cardPin, setCardPin] = useState("");
	const [cardZip, setCardZip] = useState("");
	const [apiKeyId, setApiKeyId] = useState("");
	const [apiSecret, setApiSecret] = useState("");
	const [apiEnv, setApiEnv] = useState("Production");
	const [identityName, setIdentityName] = useState("");
	const [identityEmail, setIdentityEmail] = useState("");
	const [identityPhone, setIdentityPhone] = useState("");
	const [identityAddress, setIdentityAddress] = useState("");

	const resetForm = useCallback(() => {
		setEditingItem(null);
		setItemFolderId(undefined);
		setNewTitle("");
		setNewUsername("");
		setNewPassword("");
		setNewUrl("");
		setNewNotes("");
		setCustomFields([]);
		setCardHolder("");
		setCardNumber("");
		setCardExp("");
		setCardCvv("");
		setCardPin("");
		setCardZip("");
		setApiKeyId("");
		setApiSecret("");
		setIdentityName("");
		setIdentityEmail("");
		setIdentityPhone("");
		setIdentityAddress("");
	}, []);

	const populateForm = useCallback((item: PasswordItem) => {
		setEditingItem(item);
		setItemCategory(item.category);
		setItemFolderId(item.folderId);
		setNewTitle(item.title || "");
		setNewUsername(item.username || "");
		setNewPassword(item.password || "");
		setNewUrl(item.url || "");
		setNewNotes(item.notes || "");
		setCustomFields(item.customFields || []);

		const meta = item.metadata || {};
		if (item.category === "card") {
			setCardHolder(meta.cardholderName || "");
			setCardNumber(meta.cardNumber || "");
			setCardExp(meta.expiration || "");
			setCardCvv(meta.cvv || "");
			setCardPin(meta.pin || "");
			setCardZip(meta.zipCode || "");
		} else if (item.category === "apikey") {
			setApiKeyId(meta.keyId || "");
			setApiSecret(meta.apiKey || item.password || "");
			setApiEnv(meta.environment || "Production");
		} else if (item.category === "identity") {
			setIdentityName(meta.fullName || "");
			setIdentityEmail(meta.email || item.username || "");
			setIdentityPhone(meta.phone || "");
			setIdentityAddress(meta.address || "");
		}
		setIsAddModalOpen(true);
	}, []);

	return {
		editingItem,
		setEditingItem,
		isAddModalOpen,
		setIsAddModalOpen,
		itemCategory,
		setItemCategory,
		itemFolderId,
		setItemFolderId,
		newTitle,
		setNewTitle,
		newUsername,
		setNewUsername,
		newPassword,
		setNewPassword,
		newUrl,
		setNewUrl,
		newNotes,
		setNewNotes,
		customFields,
		setCustomFields,
		isFolderDropdownOpen,
		setIsFolderDropdownOpen,
		cardHolder,
		setCardHolder,
		cardNumber,
		setCardNumber,
		cardExp,
		setCardExp,
		cardCvv,
		setCardCvv,
		cardPin,
		setCardPin,
		cardZip,
		setCardZip,
		apiKeyId,
		setApiKeyId,
		apiSecret,
		setApiSecret,
		apiEnv,
		setApiEnv,
		identityName,
		setIdentityName,
		identityEmail,
		setIdentityEmail,
		identityPhone,
		setIdentityPhone,
		identityAddress,
		setIdentityAddress,
		resetForm,
		populateForm,
	};
}
