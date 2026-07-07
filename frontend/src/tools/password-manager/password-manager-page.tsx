import React, { Suspense } from "react";
const PasswordSidebar = React.lazy(
	() => import("./components/password-sidebar"),
);
const PasswordList = React.lazy(() => import("./components/password-list"));
const PasswordDetail = React.lazy(() => import("./components/password-detail"));
import VaultOnboarding from "./components/vault-onboarding";
import VaultUnlock from "./components/vault-unlock";
import {
	AppSkeleton,
	SidebarSkeleton,
	ListSkeleton,
	DetailSkeleton,
} from "./components/skeletons";
import { useTranslation } from "react-i18next";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { encryptVault } from "./utils/vault";
import { PasswordProvider, usePassword } from "./context/password-context";
import type { PasswordItem } from "./types";
import {
	PasswordUIProvider,
	usePasswordUI,
} from "./context/password-ui-context";

function PasswordManagerInner() {
	const { t } = useTranslation();
	const {
		masterPassword,
		setMasterPassword,
		vault,
		setVault,
		loading,
		error,
		hasExistingVault,
	} = usePassword();
	const {
		activeItem,
		isNewItem,
		handleNewItem,
		handleSelect,
		handleEdit,
		handleCancelDetail,
	} = usePasswordUI();

	const saveItem = async (item: PasswordItem) => {
		if (!vault) return;
		const exists = vault.items.find((i) => i.id === item.id);
		const updated = {
			...vault,
			items: exists
				? vault.items.map((i) => (i.id === item.id ? item : i))
				: [...vault.items, item],
		};
		setVault(updated);
		await encryptVault(updated, masterPassword);
		// After saving, show the item in detail view
		handleSelect(item);
	};

	if (hasExistingVault === null) {
		return <AppSkeleton />;
	}

	if (!vault) {
		if (!hasExistingVault) {
			return <VaultOnboarding onComplete={setMasterPassword} />;
		}
		return (
			<VaultUnlock
				onUnlock={setMasterPassword}
				error={error}
				loading={loading}
			/>
		);
	}

	return (
		<TooltipProvider>
			<div className="h-full flex flex-col bg-background">
				{loading && (
					<p className="text-sm text-muted-foreground px-4 pt-2">
						{t("tools.password_manager_loading")}
					</p>
				)}
				<div className="flex-1 flex overflow-hidden rounded-2xl border border-border bg-card/50 shadow-sm backdrop-blur-sm m-4 relative">
					{/* Left - Sidebar */}
					<div className="w-[260px] flex-shrink-0 bg-sidebar overflow-hidden border-r border-border h-full">
						<SidebarProvider className="min-h-0 h-full">
							<Suspense fallback={<SidebarSkeleton />}>
								<PasswordSidebar onNewItem={handleNewItem} />
							</Suspense>
						</SidebarProvider>
					</div>

					{/* Middle - List */}
					<div className="w-[320px] flex-shrink-0 bg-background/50 overflow-hidden flex flex-col border-r border-border h-full">
						<Suspense fallback={<ListSkeleton />}>
							<PasswordList
								activeId={activeItem?.id ?? null}
								onSelect={handleSelect}
								onEdit={handleEdit}
							/>
						</Suspense>
					</div>

					{/* Right - Detail */}
					<div className="flex-1 min-w-0 overflow-hidden bg-background h-full">
						<Suspense fallback={<DetailSkeleton />}>
							<PasswordDetail
								item={activeItem}
								isNew={isNewItem}
								onSave={saveItem}
								onCancel={handleCancelDetail}
							/>
						</Suspense>
					</div>
				</div>
			</div>
		</TooltipProvider>
	);
}

export default function PasswordManagerPage() {
	return (
		<PasswordProvider>
			<PasswordUIProvider>
				<PasswordManagerInner />
			</PasswordUIProvider>
		</PasswordProvider>
	);
}
