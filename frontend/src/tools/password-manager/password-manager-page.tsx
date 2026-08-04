import React, { Suspense, useEffect, useState } from "react";
import { Provider } from "react-redux";
const PasswordSidebar = React.lazy(
	() => import("./components/password-sidebar"),
);
const PasswordList = React.lazy(() => import("./components/password-list"));
const PasswordDetail = React.lazy(() => import("./components/password-detail"));
const VaultOnboarding = React.lazy(
	() => import("./components/vault-onboarding"),
);
const CloudVaultDetected = React.lazy(
	() => import("./components/cloud-vault-detected"),
);
const VaultUnlock = React.lazy(() => import("./components/vault-unlock"));
const MobileSidebarDrawer = React.lazy(
	() => import("./components/mobile-sidebar-drawer"),
);
const SharingCenter = React.lazy(() => import("./components/sharing-center"));
const ImportWizard = React.lazy(() => import("./components/import-wizard"));
import {
	AppSkeleton,
	SidebarSkeleton,
	ListSkeleton,
	DetailSkeleton,
} from "./components/skeletons";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { store, useAppDispatch, useAppSelector } from "./store";
import {
	selectRecoveryMnemonic,
	selectRecoveryLoading,
	selectRecoveryError,
	selectHasRecoveryKey,
	selectRecoveryMode,
	selectIsUnlocked,
	selectVaultLoading,
	selectVaultError,
	selectHasExistingVault,
	selectCloudVaultStatus,
	selectActiveItem,
	selectIsNewItem,
	selectActiveFilter,
} from "./store/password-slice";
import {
	setCloudVaultStatus,
	handleNewItem,
	handleSelect,
	handleEdit,
	handleCancelDetail,
	enableCloudSync,
	setUserId,
	clearRecoveryMnemonic,
	setRecoveryMode,
} from "./store/password-slice";
import type { PasswordItem } from "./types/index";
import { useIsMobile } from "@/hooks/use-mobile";
import { useItemMutations } from "@/tools/password-manager/hooks/use-item-mutations";
import { useAuth } from "@/context/AuthContext";
import {
	checkRecoveryKey,
	createVault,
	generateRecoveryKey,
	initializeVault,
	recoverWithMnemonic,
	resetMasterPassword,
	unlockVault,
} from "./store/thunks";

function PasswordManagerInner() {
	const [searchQuery, setSearchQuery] = useState("");
	const [isImportOpen, setIsImportOpen] = useState(false);
	const isMobile = useIsMobile();
	const dispatch = useAppDispatch();
	const { user } = useAuth();
	const loading = useAppSelector(selectVaultLoading);
	const error = useAppSelector(selectVaultError);
	const hasExistingVault = useAppSelector(selectHasExistingVault);
	const cloudVaultStatus = useAppSelector(selectCloudVaultStatus);
	const activeItem = useAppSelector(selectActiveItem);
	const isNewItem = useAppSelector(selectIsNewItem);
	const activeFilter = useAppSelector(selectActiveFilter);
	const recoveryMnemonic = useAppSelector(selectRecoveryMnemonic);
	const recoveryLoading = useAppSelector(selectRecoveryLoading);
	const recoveryError = useAppSelector(selectRecoveryError);
	const hasRecoveryKey = useAppSelector(selectHasRecoveryKey);
	const recoveryMode = useAppSelector(selectRecoveryMode);
	const isUnlocked = useAppSelector(selectIsUnlocked);

	const { saveItem } = useItemMutations();

	useEffect(() => {
		if (user?._id) {
			dispatch(setUserId(user._id));
			dispatch(initializeVault());
			dispatch(checkRecoveryKey());
		}
	}, [user?._id, dispatch]);

	if (hasExistingVault === null || cloudVaultStatus === "checking") {
		return <AppSkeleton />;
	}

	if (!isUnlocked || recoveryMode) {
		if (!hasExistingVault && !recoveryMode) {
			if (cloudVaultStatus === "found") {
				return (
					<Suspense fallback={<AppSkeleton />}>
						<CloudVaultDetected
							onEnableSync={() => {
								dispatch(enableCloudSync());
							}}
							onStartFresh={() =>
								dispatch(setCloudVaultStatus("not_found"))
							}
						/>
					</Suspense>
				);
			}

			return (
				<Suspense fallback={<AppSkeleton />}>
					<VaultOnboarding
						onComplete={(password: string) =>
							dispatch(createVault(password))
						}
						onGenerateRecoveryKey={(password: string) =>
							dispatch(generateRecoveryKey(password))
						}
						recoveryMnemonic={recoveryMnemonic}
						recoveryLoading={recoveryLoading}
						onClearRecoveryMnemonic={() =>
							dispatch(clearRecoveryMnemonic())
						}
					/>
				</Suspense>
			);
		}
		return (
			<Suspense fallback={<AppSkeleton />}>
				<VaultUnlock
					onUnlock={(password: string) =>
						dispatch(unlockVault(password))
					}
					error={error}
					loading={loading}
					hasRecoveryKey={hasRecoveryKey}
					recoveryLoading={recoveryLoading}
					recoveryError={recoveryError}
					recoveryMode={recoveryMode}
					onRecoverWithMnemonic={(mnemonic: string) =>
						dispatch(recoverWithMnemonic(mnemonic))
					}
					onResetMasterPassword={(newPassword: string) =>
						dispatch(resetMasterPassword(newPassword))
					}
					onSetRecoveryMode={(mode: boolean) =>
						dispatch(setRecoveryMode(mode))
					}
				/>
			</Suspense>
		);
	}

	return (
		<TooltipProvider>
			<div className="h-full flex flex-col bg-background">
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
									/>
								</Suspense>
							</div>
						) : (
							<div className="h-full w-full overflow-hidden flex flex-col bg-background relative z-0">
								<Suspense fallback={<ListSkeleton />}>
									<PasswordList
										activeId={null}
										searchQuery={searchQuery}
										onSearchChange={setSearchQuery}
										onSelect={(item: PasswordItem) =>
											dispatch(handleSelect(item))
										}
										onEdit={(item: PasswordItem) =>
											dispatch(handleEdit(item))
										}
										onNewItem={() =>
											dispatch(handleNewItem())
										}
										onImport={() => setIsImportOpen(true)}
									/>
								</Suspense>
							</div>
						)}
					</div>
				) : (
					<div className="flex-1 flex overflow-hidden bg-pm-surface">
						{/* Sidebar */}
						<div className="w-60 shrink-0 h-full overflow-hidden border-r border-pm-border flex flex-col bg-pm-sidebar shadow-sm z-10">
							<SidebarProvider className="min-h-0 h-full w-full">
								<Suspense fallback={<SidebarSkeleton />}>
									<PasswordSidebar />
								</Suspense>
							</SidebarProvider>
						</div>

						{/* Main Content Area */}
						<div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col">
							{activeFilter === "sharing" ? (
								<Suspense fallback={<ListSkeleton />}>
									<SharingCenter />
								</Suspense>
							) : (
								<Suspense fallback={<ListSkeleton />}>
									<PasswordList
										activeId={activeItem?.id ?? null}
										searchQuery={searchQuery}
										onSearchChange={setSearchQuery}
										onSelect={(item: PasswordItem) =>
											dispatch(handleSelect(item))
										}
										onEdit={(item: PasswordItem) =>
											dispatch(handleEdit(item))
										}
										onNewItem={() =>
											dispatch(handleNewItem())
										}
										onImport={() => setIsImportOpen(true)}
									/>
								</Suspense>
							)}
						</div>

						<Drawer
							open={!!activeItem || isNewItem}
							onOpenChange={(open) => {
								if (!open) dispatch(handleCancelDetail());
							}}
							swipeDirection="right"
						>
							<DrawerContent className="sm:max-w-150 p-0 border-l border-pm-border shadow-2xl h-full rounded-none">
								<Suspense fallback={<DetailSkeleton />}>
									<PasswordDetail
										item={activeItem}
										isNew={isNewItem}
										onSave={saveItem}
									/>
								</Suspense>
							</DrawerContent>
						</Drawer>
					</div>
				)}

				<Suspense fallback={null}>
					{isImportOpen && (
						<ImportWizard
							isOpen={isImportOpen}
							onClose={() => setIsImportOpen(false)}
						/>
					)}
				</Suspense>
			</div>
		</TooltipProvider>
	);
}

export default function PasswordManagerPage() {
	return (
		<Provider store={store}>
			<PasswordManagerInner />
		</Provider>
	);
}
