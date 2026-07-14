import React, { Suspense, useEffect } from "react";
import { logger } from "@/utils/logger";
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
const SharingCenter = React.lazy(
	() => import("./components/sharing-center"),
);
import {
	AppSkeleton,
	SidebarSkeleton,
	ListSkeleton,
	DetailSkeleton,
} from "./components/skeletons";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from "@/components/ui/resizable";
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
	initializeVault,
	fetchVaultData,
	fetchSharedCollections,
	unlockVault,
	createVault,
	enableCloudSync,
	setUserId,
	generateRecoveryKey,
	checkRecoveryKey,
	recoverWithMnemonic,
	resetMasterPassword,
	clearRecoveryMnemonic,
	setRecoveryMode,
} from "./store/password-slice";
import type { PasswordItem } from "./types/index";
import { useIsMobile } from "@/hooks/use-mobile";
import { useItemMutations } from "@/tools/password-manager/hooks/use-item-mutations";
import { useAuth } from "@/context/AuthContext";

function PasswordManagerInner() {
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
		}
	}, [user, dispatch]);

	useEffect(() => {
		dispatch(initializeVault());
	}, [dispatch]);

	useEffect(() => {
		if (user?._id) {
			dispatch(checkRecoveryKey());
		}
	}, [user, dispatch]);

	useEffect(() => {
		if (isUnlocked && user?._id) {
			const handleFocus = () => {
				logger.info("[Vault] Window focused, syncing shared collections...");
				dispatch(fetchSharedCollections()).then(() => dispatch(fetchVaultData()));
			};

			window.addEventListener("focus", handleFocus);
			return () => {
				window.removeEventListener("focus", handleFocus);
			};
		}
	}, [isUnlocked, user?._id, dispatch]);

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
										onCancel={() =>
											dispatch(handleCancelDetail())
										}
									/>
								</Suspense>
							</div>
						) : (
							<div className="h-full w-full overflow-hidden flex flex-col bg-background relative z-0">
								<Suspense fallback={<ListSkeleton />}>
									<PasswordList
										activeId={null}
										onSelect={(item: PasswordItem) =>
											dispatch(handleSelect(item))
										}
										onEdit={(item: PasswordItem) =>
											dispatch(handleEdit(item))
										}
									/>
								</Suspense>
							</div>
						)}
					</div>
				) : (
					<div className="flex-1 flex overflow-hidden rounded-2xl border border-white/5 bg-vault-bg shadow-2xl m-4 relative">
						<ResizablePanelGroup
							orientation="horizontal"
							id="password-manager-layout"
						>
							{/* Left - Sidebar */}
							<ResizablePanel
								defaultSize="20%"
								minSize="15%"
								maxSize="35%"
								className="bg-vault-panel"
							>
								<div className="h-full w-full overflow-hidden border-r border-white/5 flex flex-col">
									<SidebarProvider className="min-h-0 h-full w-full">
										<Suspense
											fallback={<SidebarSkeleton />}
										>
											<PasswordSidebar
												onNewItem={(
													itemType?: string,
												) =>
													dispatch(
														handleNewItem(itemType),
													)
												}
											/>
										</Suspense>
									</SidebarProvider>
								</div>
							</ResizablePanel>

							<ResizableHandle className="w-px bg-white/5 hover:bg-primary/50 transition-colors cursor-col-resize z-10" />

							{activeFilter === "sharing" ? (
								<ResizablePanel
									defaultSize="80%"
									minSize="50%"
									className="bg-vault-panel"
								>
									<div className="h-full w-full overflow-hidden flex flex-col">
										<Suspense fallback={<ListSkeleton />}>
											<SharingCenter />
										</Suspense>
									</div>
								</ResizablePanel>
							) : (
								<>
									{/* Middle - List */}
									<ResizablePanel
										defaultSize="25%"
										minSize="20%"
										maxSize="40%"
										className="bg-vault-panel"
									>
										<div className="h-full w-full overflow-hidden flex flex-col border-r border-white/5">
											<Suspense fallback={<ListSkeleton />}>
												<PasswordList
													activeId={activeItem?.id ?? null}
													onSelect={(item: PasswordItem) =>
														dispatch(handleSelect(item))
													}
													onEdit={(item: PasswordItem) =>
														dispatch(handleEdit(item))
													}
												/>
											</Suspense>
										</div>
									</ResizablePanel>

									<ResizableHandle className="w-px bg-white/5 hover:bg-primary/50 transition-colors cursor-col-resize z-10" />

									{/* Right - Detail */}
									<ResizablePanel
										defaultSize="55%"
										minSize="30%"
										className="bg-vault-card"
									>
										<div className="h-full w-full overflow-hidden flex flex-col">
											<Suspense fallback={<DetailSkeleton />}>
												<PasswordDetail
													item={activeItem}
													isNew={isNewItem}
													onSave={saveItem}
													onCancel={() =>
														dispatch(handleCancelDetail())
													}
												/>
											</Suspense>
										</div>
									</ResizablePanel>
								</>
							)}
						</ResizablePanelGroup>
					</div>
				)}
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
