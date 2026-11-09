import * as React from "react";
import { Folder, FolderPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	CreatableCombobox,
	type ComboboxOption,
} from "@/components/ui/creatable-combobox";
import { useFolderMutations } from "../hooks/use-folder-mutations";
import { UI_DEFAULTS, FOLDER_ICONS } from "../utils/constants";
import type { Folder as FolderType } from "../types";

export interface FolderComboboxProps {
	folders: FolderType[];
	value: string | undefined | null;
	onChange: (folderId: string | null) => void;
	placeholder?: string;
	className?: string;
	triggerClassName?: string;
	showNoneOption?: boolean;
	noneLabel?: string;
	isDisabled?: boolean;
}

export function FolderCombobox({
	folders,
	value,
	onChange,
	placeholder,
	className,
	triggerClassName,
	showNoneOption = true,
	noneLabel,
	isDisabled = false,
}: FolderComboboxProps) {
	const { t } = useTranslation();
	const { createFolder } = useFolderMutations();

	const defaultNoFolder =
		noneLabel ??
		t("tools.password_manager.no_folder", {
			defaultValue: "No Folder",
		});

	const comboboxOptions: ComboboxOption[] = React.useMemo(() => {
		const list: ComboboxOption[] = [];

		if (showNoneOption) {
			list.push({
				value: "none",
				label: defaultNoFolder,
				icon: (
					<Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
				),
			});
		}

		folders.forEach((f) => {
			const IconComp = f.iconName
				? FOLDER_ICONS.find((i) => i.id === f.iconName)?.icon || Folder
				: Folder;

			list.push({
				value: f.id,
				label: f.name,
				color: f.color,
				icon: (
					<IconComp
						className="h-4 w-4 shrink-0"
						style={{
							color: f.color || undefined,
							fill:
								!f.iconName || f.iconName === "folder"
									? f.color || "transparent"
									: "transparent",
						}}
					/>
				),
			});
		});

		return list;
	}, [folders, showNoneOption, defaultNoFolder]);

	const selectedValue = React.useMemo(() => {
		if (!value || value === "none") {
			return showNoneOption ? "none" : "";
		}
		return value;
	}, [value, showNoneOption]);

	const handleSelect = (selectedId: string) => {
		if (selectedId === "none") {
			onChange(null);
		} else {
			onChange(selectedId);
		}
	};

	const handleCreate = (newFolderName: string) => {
		const trimmed = newFolderName.trim();
		if (!trimmed) return;

		// Check if a folder with this name already exists (case-insensitive)
		const existing = folders.find(
			(f) => f.name.toLowerCase() === trimmed.toLowerCase(),
		);
		if (existing) {
			onChange(existing.id);
			return;
		}

		const created = createFolder(
			trimmed,
			UI_DEFAULTS.FOLDER_COLOR,
			"folder",
		);
		if (created?.id) {
			onChange(created.id);
		}
	};

	return (
		<CreatableCombobox
			options={comboboxOptions}
			value={selectedValue}
			onSelect={handleSelect}
			onCreate={handleCreate}
			placeholder={
				placeholder ||
				t("tools.password_manager.select_folder", {
					defaultValue: "Select folder...",
				})
			}
			searchPlaceholder={t(
				"tools.password_manager.search_or_create_folder",
				{
					defaultValue: "Search or create folder...",
				},
			)}
			emptyPlaceholder={t("tools.password_manager.no_folders_found", {
				defaultValue: "No folders found",
			})}
			createLabel={(name) => (
				<span className="flex items-center gap-1.5">
					<FolderPlus className="h-3.5 w-3.5 shrink-0" />
					<span>
						{t("tools.password_manager.create_folder_named", {
							defaultValue: 'Create folder "{{name}}"',
							name,
						})}
					</span>
				</span>
			)}
			isDisabled={isDisabled}
			className={className}
			triggerClassName={triggerClassName}
		/>
	);
}
