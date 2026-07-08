import React, { Suspense } from "react";
const PasswordSidebar = React.lazy(
	() => import("./components/password-sidebar"),
);
const PasswordList = React.lazy(() => import("./components/password-list"));
const PasswordDetail = React.lazy(() => import("./components/password-detail"));
const VaultOnboarding = React.lazy(
	() => import("./components/vault-onboarding"),
);
const VaultUnlock = React.lazy(() => import("./components/vault-unlock"));
const MobileSidebarDrawer = React.lazy(
	() => import("./components/mobile-sidebar-drawer"),
);
import {
	AppSkeleton,
	SidebarSkeleton,
	ListSkeleton,
	DetailSkeleton,
} from "./components/skeletons";
import { useTranslation } from "react-i18next";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { encryptVault } from "./utils/vault";
import { PasswordProvider, usePassword } from "./context/password-context";
import type { PasswordItem } from "./types/index";
import {
	PasswordUIProvider,
	usePasswordUI,
} from "./context/password-ui-context";
import { useIsMobile } from "@/hooks/use-mobile";

function PasswordManagerInner() {
	const { t } = useTranslation();
	const isMobile = useIsMobile();
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
			return (
				<Suspense fallback={<AppSkeleton />}>
					<VaultOnboarding onComplete={setMasterPassword} />
				</Suspense>
			);
		}
		return (
			<Suspense fallback={<AppSkeleton />}>
				<VaultUnlock
					onUnlock={setMasterPassword}
					error={error}
					loading={loading}
				/>
			</Suspense>
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
				{isMobile ? (
					<div className="flex-1 flex overflow-hidden relative">
						<Suspense fallback={<SidebarSkeleton />}>
							<MobileSidebarDrawer />
						</Suspense>
						{activeItem || isNewItem ? (
							<div className="h-full w-full overflow-hidden flex flex-col bg-background absolute inset-0 z-10">
								<Suspense fallback={<DetailSkeleton />}>
									<PasswordDetail
										item={activeItem}
										isNew={isNewItem}
										onSave={saveItem}
										onCancel={handleCancelDetail}
									/>
								</Suspense>
							</div>
						) : (
							<div className="h-full w-full overflow-hidden flex flex-col bg-background relative z-0">
								<Suspense fallback={<ListSkeleton />}>
									<PasswordList
										activeId={null}
										onSelect={handleSelect}
										onEdit={handleEdit}
									/>
								</Suspense>
							</div>
						)}
					</div>
				) : (
					<div className="flex-1 flex overflow-hidden rounded-2xl border border-border bg-card/50 shadow-sm backdrop-blur-sm m-4 relative">
						<ResizablePanelGroup
							orientation="horizontal"
							id="password-manager-layout"
						>
							{/* Left - Sidebar */}
							<ResizablePanel
								defaultSize="20%"
								minSize="15%"
								maxSize="35%"
								className="bg-sidebar"
							>
								<div className="h-full w-full overflow-hidden border-r border-border flex flex-col">
									<SidebarProvider className="min-h-0 h-full w-full">
										<Suspense
											fallback={<SidebarSkeleton />}
										>
											<PasswordSidebar
												onNewItem={handleNewItem}
											/>
										</Suspense>
									</SidebarProvider>
								</div>
							</ResizablePanel>

							<ResizableHandle className="w-1 bg-border/50 hover:bg-primary/50 transition-colors cursor-col-resize z-10" />

							{/* Middle - List */}
							<ResizablePanel
								defaultSize="25%"
								minSize="20%"
								maxSize="40%"
								className="bg-background/50"
							>
								<div className="h-full w-full overflow-hidden flex flex-col border-r border-border">
									<Suspense fallback={<ListSkeleton />}>
										<PasswordList
											activeId={activeItem?.id ?? null}
											onSelect={handleSelect}
											onEdit={handleEdit}
										/>
									</Suspense>
								</div>
							</ResizablePanel>

							<ResizableHandle className="w-1 bg-border/50 hover:bg-primary/50 transition-colors cursor-col-resize z-10" />

							{/* Right - Detail */}
							<ResizablePanel
								defaultSize="55%"
								minSize="30%"
								className="bg-background"
							>
								<div className="h-full w-full overflow-hidden flex flex-col">
									<Suspense fallback={<DetailSkeleton />}>
										<PasswordDetail
											item={activeItem}
											isNew={isNewItem}
											onSave={saveItem}
											onCancel={handleCancelDetail}
										/>
									</Suspense>
								</div>
							</ResizablePanel>
						</ResizablePanelGroup>
					</div>
				)}
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
