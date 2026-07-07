/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from "react";
import type { PasswordItem } from "../types";

interface PasswordUIContextValue {
	activeItem: PasswordItem | null;
	setActiveItem: (item: PasswordItem | null) => void;
	isNewItem: boolean;
	setIsNewItem: (value: boolean) => void;
	activeFilter: string;
	setActiveFilter: (filter: string) => void;
	handleNewItem: (itemType?: string) => void;
	handleSelect: (item: PasswordItem) => void;
	handleEdit: (item: PasswordItem) => void;
	handleCancelDetail: () => void;
}

const PasswordUIContext = createContext<PasswordUIContextValue | undefined>(
	undefined,
);

export const usePasswordUI = () => {
	const ctx = useContext(PasswordUIContext);
	if (!ctx)
		throw new Error(
			"usePasswordUI must be used within a PasswordUIProvider",
		);
	return ctx;
};

export const PasswordUIProvider = ({ children }: { children: ReactNode }) => {
	const [activeItem, setActiveItem] = useState<PasswordItem | null>(null);
	const [isNewItem, setIsNewItem] = useState(false);
	const [activeFilter, setActiveFilter] = useState("all");

	const handleNewItem = (itemType: string = "login") => {
		setActiveItem({ itemType } as PasswordItem);
		setIsNewItem(true);
	};

	const handleSelect = (item: PasswordItem) => {
		setActiveItem(item);
		setIsNewItem(false);
	};

	const handleEdit = (item: PasswordItem) => {
		setActiveItem(item);
		setIsNewItem(true);
	};

	const handleCancelDetail = () => {
		setActiveItem(null);
		setIsNewItem(false);
	};

	return (
		<PasswordUIContext.Provider
			value={{
				activeItem,
				setActiveItem,
				isNewItem,
				setIsNewItem,
				activeFilter,
				setActiveFilter,
				handleNewItem,
				handleSelect,
				handleEdit,
				handleCancelDetail,
			}}
		>
			{children}
		</PasswordUIContext.Provider>
	);
};
