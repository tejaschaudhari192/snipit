import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Shield,
	Key,
	CopyX,
	CreditCard,
	FileCode,
	Fingerprint,
	ShieldAlert,
	Plus,
	Layers,
	FileText,
	HardDrive,
	ArrowUpRight,
	Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppDispatch, useAppSelector } from "../../store";
import {
	selectVault,
	selectVaultLoading,
	setActiveFilter,
	handleNewItem,
	handleSelect,
	setSidebarDrawerOpen,
} from "../../store/password-slice";
import { analyzeVaultSecurity } from "../../utils/security-audit";
import { MetricCard } from "./metric-card";
import { SecurityGauge } from "./security-gauge";
import { VulnerabilityList } from "./vulnerability-list";
import type { PasswordItem } from "../../types";
import { FindDuplicatesWizard } from "../find-duplicates-wizard";
import { DashboardSkeleton } from "../skeletons";

interface VaultDashboardProps {
	onNewItem?: () => void;
	onImport?: () => void;
}

export default function VaultDashboard({ onNewItem }: VaultDashboardProps) {
	const { t } = useTranslation();
	const isMobile = useIsMobile();
	const dispatch = useAppDispatch();
	const vault = useAppSelector(selectVault);
	const isLoading = useAppSelector(selectVaultLoading);
	const items = useMemo(() => vault?.items || [], [vault?.items]);

	const [isDuplicateWizardOpen, setIsDuplicateWizardOpen] = useState(false);

	// Compute real-time audit report
	const report = useMemo(() => analyzeVaultSecurity(items), [items]);

	if (isLoading && items.length === 0) {
		return <DashboardSkeleton />;
	}

	const handleOpenItem = (item: PasswordItem) => {
		dispatch(handleSelect(item));
	};

	const handleFilterTo = (filterId: string) => {
		dispatch(setActiveFilter(filterId));
	};

	return (
		<div className="flex-1 overflow-y-auto no-scrollbar bg-background">
			{/* Top Hero Banner */}
			<div className="border-b border-border/60 bg-muted/10 px-6 sm:px-8 py-6">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							{isMobile && (
								<Button
									variant="ghost"
									size="icon"
									onClick={() =>
										dispatch(setSidebarDrawerOpen(true))
									}
									className="h-9 w-9 -ml-2 text-muted-foreground hover:text-foreground shrink-0"
									aria-label="Open sidebar"
								>
									<Menu className="h-5 w-5" />
								</Button>
							)}
							<div className="p-1.5 rounded-lg bg-primary/10 text-primary">
								<Shield className="w-5 h-5" />
							</div>
							<h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
								{t(
									"tools.password_manager.dashboard_view.title",
								)}
							</h1>
						</div>
						<p className="text-xs sm:text-sm text-muted-foreground">
							{t(
								"tools.password_manager.dashboard_view.subtitle",
							)}
						</p>
					</div>

					{/* Quick Actions */}
					<div className="flex items-center gap-2.5 flex-wrap">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setIsDuplicateWizardOpen(true)}
							className="h-9 px-3.5 rounded-xl border-border/80 hover:bg-muted font-medium text-xs gap-1.5 shadow-2xs"
						>
							<CopyX className="w-3.5 h-3.5" />
							<span>
								{t(
									"tools.password_manager.dashboard_view.find_duplicates",
								)}
							</span>
						</Button>

						<Button
							type="button"
							size="sm"
							onClick={() => {
								if (onNewItem) onNewItem();
								else dispatch(handleNewItem());
							}}
							className="h-9 px-4 rounded-xl font-medium text-xs gap-1.5 shadow-xs"
						>
							<Plus className="w-4 h-4" />
							<span>
								{t(
									"tools.password_manager.dashboard_view.new_entry",
								)}
							</span>
						</Button>
					</div>
				</div>
			</div>

			<div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
				{/* Top KPI Metric Cards (Stripe-Style Tiles) */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<MetricCard
						title={t(
							"tools.password_manager.dashboard_view.total_assets",
						)}
						value={report.totalItems}
						subtitle={t(
							"tools.password_manager.dashboard_view.logins_cards",
							{
								logins: report.loginsCount,
								cards: report.cardsCount,
							},
						)}
						icon={Layers}
						badge={{
							text: t(
								"tools.password_manager.dashboard_view.active",
							),
							variant: "default",
						}}
						onClick={() => handleFilterTo("all")}
						progressValue={100}
						progressColor="bg-primary"
					/>

					<MetricCard
						title={t(
							"tools.password_manager.dashboard_view.security_health",
						)}
						value={`${report.healthScore}%`}
						subtitle={
							report.healthStatus === "excellent"
								? t(
										"tools.password_manager.dashboard_view.status_excellent",
									)
								: report.healthStatus === "good"
									? t(
											"tools.password_manager.dashboard_view.status_good",
										)
									: t(
											"tools.password_manager.dashboard_view.status_review",
										)
						}
						icon={Shield}
						badge={{
							text: report.healthStatus.toUpperCase(),
							variant:
								report.healthStatus === "excellent"
									? "success"
									: report.healthStatus === "good"
										? "info"
										: report.healthStatus === "warning"
											? "warning"
											: "destructive",
						}}
						progressValue={report.healthScore}
						progressColor={
							report.healthScore >= 80
								? "bg-emerald-500"
								: report.healthScore >= 60
									? "bg-amber-500"
									: "bg-rose-500"
						}
					/>

					<MetricCard
						title={t(
							"tools.password_manager.dashboard_view.weak_passwords",
						)}
						value={report.weakPasswordsCount}
						subtitle={
							report.weakPasswordsCount === 0
								? t(
										"tools.password_manager.dashboard_view.no_weak_credentials",
									)
								: t(
										"tools.password_manager.dashboard_view.items_need_stronger",
										{
											count: report.weakPasswordsCount,
										},
									)
						}
						icon={ShieldAlert}
						badge={{
							text:
								report.weakPasswordsCount === 0
									? t(
											"tools.password_manager.dashboard_view.passed",
										)
									: t(
											"tools.password_manager.dashboard_view.action",
										),
							variant:
								report.weakPasswordsCount === 0
									? "success"
									: "destructive",
						}}
						progressValue={
							report.totalPasswordsEvaluated > 0
								? (report.weakPasswordsCount /
										report.totalPasswordsEvaluated) *
									100
								: 0
						}
						progressColor="bg-rose-500"
					/>

					<MetricCard
						title={t(
							"tools.password_manager.dashboard_view.reused_keys",
						)}
						value={report.reusedPasswordsCount}
						subtitle={
							report.reusedPasswordsCount === 0
								? t(
										"tools.password_manager.dashboard_view.zero_collisions",
									)
								: t(
										"tools.password_manager.dashboard_view.used_multiple_accounts",
									)
						}
						icon={CopyX}
						badge={{
							text:
								report.reusedPasswordsCount === 0
									? t(
											"tools.password_manager.dashboard_view.secure",
										)
									: t(
											"tools.password_manager.dashboard_view.warning",
										),
							variant:
								report.reusedPasswordsCount === 0
									? "success"
									: "warning",
						}}
						progressValue={
							report.totalPasswordsEvaluated > 0
								? (report.reusedPasswordsCount /
										report.totalPasswordsEvaluated) *
									100
								: 0
						}
						progressColor="bg-amber-500"
					/>
				</div>

				{/* Two-Column Analytics: Security Gauge + Password Strength Spectrum */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					{/* Circular Health Gauge Tile */}
					<div className="lg:col-span-6 flex">
						<SecurityGauge
							score={report.healthScore}
							status={report.healthStatus}
							totalEvaluated={report.totalPasswordsEvaluated}
							className="w-full"
						/>
					</div>

					{/* Password Strength Spectrum Breakdown */}
					<div className="lg:col-span-6 flex flex-col justify-between p-6 rounded-2xl bg-card border border-border/70 shadow-xs">
						<div>
							<div className="flex items-center justify-between mb-2">
								<h3 className="text-sm font-bold text-foreground">
									{t(
										"tools.password_manager.dashboard_view.strength_spectrum_title",
									)}
								</h3>
								<span className="text-xs text-muted-foreground font-medium">
									{t(
										"tools.password_manager.dashboard_view.evaluated_count",
										{
											count: report.totalPasswordsEvaluated,
										},
									)}
								</span>
							</div>
							<p className="text-xs text-muted-foreground">
								{t(
									"tools.password_manager.dashboard_view.strength_spectrum_desc",
								)}
							</p>

							{/* Multi-segmented distribution bar */}
							<div className="h-3 rounded-full bg-muted/60 overflow-hidden flex my-4 gap-0.5">
								{report.totalPasswordsEvaluated === 0 ? (
									<div className="w-full bg-muted h-full" />
								) : (
									<>
										<div
											title={`${t("tools.password_manager.dashboard_view.very_weak")}: ${report.scoreDistribution.veryWeak}`}
											className="bg-rose-500 h-full transition-all duration-500"
											style={{
												width: `${(report.scoreDistribution.veryWeak / report.totalPasswordsEvaluated) * 100}%`,
											}}
										/>
										<div
											title={`${t("tools.password_manager.dashboard_view.weak")}: ${report.scoreDistribution.weak}`}
											className="bg-orange-500 h-full transition-all duration-500"
											style={{
												width: `${(report.scoreDistribution.weak / report.totalPasswordsEvaluated) * 100}%`,
											}}
										/>
										<div
											title={`${t("tools.password_manager.dashboard_view.fair")}: ${report.scoreDistribution.fair}`}
											className="bg-amber-500 h-full transition-all duration-500"
											style={{
												width: `${(report.scoreDistribution.fair / report.totalPasswordsEvaluated) * 100}%`,
											}}
										/>
										<div
											title={`${t("tools.password_manager.dashboard_view.strong")}: ${report.scoreDistribution.strong}`}
											className="bg-blue-500 h-full transition-all duration-500"
											style={{
												width: `${(report.scoreDistribution.strong / report.totalPasswordsEvaluated) * 100}%`,
											}}
										/>
										<div
											title={`${t("tools.password_manager.dashboard_view.very_strong")}: ${report.scoreDistribution.veryStrong}`}
											className="bg-emerald-500 h-full transition-all duration-500"
											style={{
												width: `${(report.scoreDistribution.veryStrong / report.totalPasswordsEvaluated) * 100}%`,
											}}
										/>
									</>
								)}
							</div>
						</div>

						{/* Legend */}
						<div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-border/50 text-xs">
							<div className="flex items-center gap-1.5">
								<span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
								<span className="text-muted-foreground">
									{t(
										"tools.password_manager.dashboard_view.very_weak",
									)}{" "}
									({report.scoreDistribution.veryWeak})
								</span>
							</div>
							<div className="flex items-center gap-1.5">
								<span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
								<span className="text-muted-foreground">
									{t(
										"tools.password_manager.dashboard_view.weak",
									)}{" "}
									({report.scoreDistribution.weak})
								</span>
							</div>
							<div className="flex items-center gap-1.5">
								<span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
								<span className="text-muted-foreground">
									{t(
										"tools.password_manager.dashboard_view.fair",
									)}{" "}
									({report.scoreDistribution.fair})
								</span>
							</div>
							<div className="flex items-center gap-1.5">
								<span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
								<span className="text-muted-foreground">
									{t(
										"tools.password_manager.dashboard_view.strong",
									)}{" "}
									({report.scoreDistribution.strong})
								</span>
							</div>
							<div className="flex items-center gap-1.5">
								<span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
								<span className="text-muted-foreground">
									{t(
										"tools.password_manager.dashboard_view.very_strong",
									)}{" "}
									({report.scoreDistribution.veryStrong})
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Asset Inventory Breakdown Cards (Logins, Cards, API Keys, Passkeys, Cred Files, Notes) */}
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
					<div
						onClick={() => handleFilterTo("login")}
						className="p-3.5 rounded-xl bg-card border border-border/60 hover:border-primary/40 cursor-pointer transition-all hover:shadow-xs group"
					>
						<div className="flex items-center justify-between mb-1.5">
							<Key className="w-4 h-4 text-blue-500" />
							<ArrowUpRight className="w-3 h-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
						</div>
						<span className="text-lg font-bold text-foreground block">
							{report.loginsCount}
						</span>
						<span className="text-[11px] text-muted-foreground font-medium">
							{t("tools.password_manager.dashboard_view.logins")}
						</span>
					</div>

					<div
						onClick={() => handleFilterTo("card")}
						className="p-3.5 rounded-xl bg-card border border-border/60 hover:border-primary/40 cursor-pointer transition-all hover:shadow-xs group"
					>
						<div className="flex items-center justify-between mb-1.5">
							<CreditCard className="w-4 h-4 text-purple-500" />
							<ArrowUpRight className="w-3 h-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
						</div>
						<span className="text-lg font-bold text-foreground block">
							{report.cardsCount}
						</span>
						<span className="text-[11px] text-muted-foreground font-medium">
							{t("tools.password_manager.dashboard_view.cards")}
						</span>
					</div>

					<div
						onClick={() => handleFilterTo("apikey")}
						className="p-3.5 rounded-xl bg-card border border-border/60 hover:border-primary/40 cursor-pointer transition-all hover:shadow-xs group"
					>
						<div className="flex items-center justify-between mb-1.5">
							<FileCode className="w-4 h-4 text-emerald-500" />
							<ArrowUpRight className="w-3 h-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
						</div>
						<span className="text-lg font-bold text-foreground block">
							{report.apiKeysCount}
						</span>
						<span className="text-[11px] text-muted-foreground font-medium">
							{t(
								"tools.password_manager.dashboard_view.api_keys",
							)}
						</span>
					</div>

					<div
						onClick={() => handleFilterTo("passkey")}
						className="p-3.5 rounded-xl bg-card border border-border/60 hover:border-primary/40 cursor-pointer transition-all hover:shadow-xs group"
					>
						<div className="flex items-center justify-between mb-1.5">
							<Fingerprint className="w-4 h-4 text-amber-500" />
							<ArrowUpRight className="w-3 h-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
						</div>
						<span className="text-lg font-bold text-foreground block">
							{report.passkeysCount}
						</span>
						<span className="text-[11px] text-muted-foreground font-medium">
							{t(
								"tools.password_manager.dashboard_view.passkeys",
							)}
						</span>
					</div>

					<div
						onClick={() => handleFilterTo("credfile")}
						className="p-3.5 rounded-xl bg-card border border-border/60 hover:border-primary/40 cursor-pointer transition-all hover:shadow-xs group"
					>
						<div className="flex items-center justify-between mb-1.5">
							<HardDrive className="w-4 h-4 text-rose-500" />
							<ArrowUpRight className="w-3 h-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
						</div>
						<span className="text-lg font-bold text-foreground block">
							{report.credFilesCount}
						</span>
						<span className="text-[11px] text-muted-foreground font-medium">
							{t(
								"tools.password_manager.dashboard_view.cred_files",
							)}
						</span>
					</div>

					<div
						onClick={() => handleFilterTo("note")}
						className="p-3.5 rounded-xl bg-card border border-border/60 hover:border-primary/40 cursor-pointer transition-all hover:shadow-xs group"
					>
						<div className="flex items-center justify-between mb-1.5">
							<FileText className="w-4 h-4 text-cyan-500" />
							<ArrowUpRight className="w-3 h-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
						</div>
						<span className="text-lg font-bold text-foreground block">
							{report.notesCount}
						</span>
						<span className="text-[11px] text-muted-foreground font-medium">
							{t(
								"tools.password_manager.dashboard_view.secure_notes",
							)}
						</span>
					</div>
				</div>

				{/* Detailed Vulnerability & Recommendation Audit List */}
				<VulnerabilityList
					weakItems={report.weakItems}
					reusedItems={report.reusedItems}
					staleItems={report.staleItems}
					onSelectItem={handleOpenItem}
				/>
			</div>

			{/* Duplicate Items Modal */}
			{isDuplicateWizardOpen && (
				<FindDuplicatesWizard
					isOpen={isDuplicateWizardOpen}
					onClose={() => setIsDuplicateWizardOpen(false)}
					items={items}
				/>
			)}
		</div>
	);
}
