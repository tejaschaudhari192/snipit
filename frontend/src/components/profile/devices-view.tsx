import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
	Laptop,
	Smartphone,
	Tablet,
	ShieldCheck,
	LogOut,
	Clock,
	Globe,
	CheckCircle2,
	RefreshCw,
	AlertCircle,
	Shield,
} from "lucide-react";
import {
	getActiveSessions,
	revokeSession,
	revokeAllOtherSessions,
	type ActiveSession,
} from "@/lib/api/auth";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { ShimmerSection } from "@/components/common/shimmer-section";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

export function DevicesView() {
	const { t } = useTranslation();
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const [sessions, setSessions] = useState<ActiveSession[]>([]);
	const [loading, setLoading] = useState(true);
	const [revokingId, setRevokingId] = useState<string | null>(null);
	const [isRevokingAll, setIsRevokingAll] = useState(false);

	// Revoke confirmation dialog state
	const [sessionToRevoke, setSessionToRevoke] =
		useState<ActiveSession | null>(null);
	const [isRevokeAllOpen, setIsRevokeAllOpen] = useState(false);

	const fetchSessions = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		try {
			const data = await getActiveSessions();
			setSessions(data);
		} catch (error) {
			console.error("Failed to load sessions", error);
			toast.add({
				title: "Failed to load active sessions",
				type: "error",
			});
		} finally {
			setLoading(false);
		}
	}, [user]);

	useEffect(() => {
		fetchSessions();
	}, [fetchSessions]);

	const handleRevokeSingle = async () => {
		if (!sessionToRevoke) return;
		setRevokingId(sessionToRevoke._id);
		try {
			const res = await revokeSession(sessionToRevoke._id);
			if (res.isCurrent) {
				await logout();
				navigate("/login");
				return;
			}
			setSessions((prev) =>
				prev.filter((s) => s._id !== sessionToRevoke._id),
			);
			toast.add({
				title: t("profile.devices.revoked_success"),
				type: "success",
			});
		} catch (error) {
			console.error("Failed to revoke session", error);
			toast.add({
				title: "Failed to revoke session",
				type: "error",
			});
		} finally {
			setRevokingId(null);
			setSessionToRevoke(null);
		}
	};

	const handleRevokeAllOthers = async () => {
		setIsRevokingAll(true);
		try {
			await revokeAllOtherSessions();
			setSessions((prev) => prev.filter((s) => s.isCurrent));
			toast.add({
				title: t("profile.devices.revoked_all_success"),
				type: "success",
			});
		} catch (error) {
			console.error("Failed to revoke other sessions", error);
			toast.add({
				title: "Failed to revoke sessions",
				type: "error",
			});
		} finally {
			setIsRevokingAll(false);
			setIsRevokeAllOpen(false);
		}
	};

	const currentSession = sessions.find((s) => s.isCurrent);
	const otherSessions = sessions.filter((s) => !s.isCurrent);

	const getDeviceIcon = (
		type: "desktop" | "mobile" | "tablet",
		className = "w-5 h-5",
	) => {
		switch (type) {
			case "mobile":
				return <Smartphone className={className} />;
			case "tablet":
				return <Tablet className={className} />;
			default:
				return <Laptop className={className} />;
		}
	};

	const formatDate = (dateStr: string) => {
		try {
			return new Date(dateStr).toLocaleDateString(undefined, {
				month: "short",
				day: "numeric",
				year: "numeric",
			});
		} catch {
			return dateStr;
		}
	};

	const formatRelativeTime = (dateStr: string) => {
		try {
			const diffMs = Date.now() - new Date(dateStr).getTime();
			const diffMins = Math.floor(diffMs / 60000);
			if (diffMins < 2) {
				return t("profile.devices.time_just_now");
			}
			if (diffMins < 60) {
				return t("profile.devices.time_mins_ago", {
					count: diffMins,
				});
			}
			const diffHours = Math.floor(diffMins / 60);
			if (diffHours < 24) {
				return t("profile.devices.time_hours_ago", {
					count: diffHours,
				});
			}
			const diffDays = Math.floor(diffHours / 24);
			return t("profile.devices.time_days_ago", {
				count: diffDays,
			});
		} catch {
			return t("profile.devices.time_recently");
		}
	};

	if (!user) {
		return (
			<div className="p-8 md:p-16 rounded-3xl border border-border/50 bg-background/60 backdrop-blur-2xl shadow-xl text-center max-w-lg mx-auto space-y-4">
				<div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
					<Shield className="w-7 h-7" />
				</div>
				<h3 className="text-xl font-black text-foreground">
					{t("profile.devices.guest_warning_title")}
				</h3>
				<p className="text-sm text-muted-foreground leading-relaxed">
					{t("profile.devices.guest_warning_desc")}
				</p>
				<div className="pt-2 flex justify-center gap-3">
					<Button
						onClick={() => navigate("/login")}
						className="rounded-xl px-6 font-bold"
					>
						{t("header.login")}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
			{/* Header Banner */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 rounded-3xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-lg ring-1 ring-white/5">
				<div className="flex items-center gap-3.5">
					<div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-xs">
						<ShieldCheck className="w-6 h-6" />
					</div>
					<div>
						<h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
							{t("profile.devices.title")}
						</h2>
						<p className="text-xs md:text-sm text-muted-foreground font-medium">
							{t("profile.devices.subtitle")}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 self-end sm:self-auto">
					<Button
						variant="outline"
						size="sm"
						onClick={fetchSessions}
						disabled={loading}
						className="h-9 gap-1.5 rounded-xl text-xs font-bold border-border/50 bg-card/60 hover:bg-secondary transition-all cursor-pointer"
					>
						<RefreshCw
							className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
						/>
						<span>{t("profile.devices.refresh")}</span>
					</Button>

					{otherSessions.length > 0 && (
						<Button
							variant="destructive"
							size="sm"
							onClick={() => setIsRevokeAllOpen(true)}
							disabled={isRevokingAll}
							className="h-9 gap-1.5 rounded-xl text-xs font-bold shadow-sm shadow-destructive/20 cursor-pointer"
						>
							<LogOut className="w-3.5 h-3.5" />
							<span>
								{t("profile.devices.revoke_all_others")}
							</span>
						</Button>
					)}
				</div>
			</div>

			{loading ? (
				<div className="space-y-4">
					<ShimmerSection type="card" className="h-36 rounded-3xl" />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<ShimmerSection
							type="card"
							className="h-32 rounded-2xl"
						/>
						<ShimmerSection
							type="card"
							className="h-32 rounded-2xl"
						/>
					</div>
				</div>
			) : (
				<>
					{/* Current Device Hero Card */}
					{currentSession && (
						<div className="p-6 md:p-7 rounded-3xl border-2 border-primary/40 bg-linear-to-br from-primary/5 via-background/80 to-background/60 backdrop-blur-xl shadow-xl ring-1 ring-primary/20 relative overflow-hidden">
							<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
								<div className="flex items-start gap-4">
									<div className="w-13 h-13 rounded-2xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shrink-0 shadow-md">
										{getDeviceIcon(
											currentSession.deviceType,
											"w-6 h-6",
										)}
									</div>
									<div className="space-y-1.5 min-w-0">
										<div className="flex flex-wrap items-center gap-2">
											<h3 className="text-lg md:text-xl font-bold text-foreground">
												{currentSession.deviceName}
											</h3>
											<Badge
												variant="outline"
												className="gap-1.5 px-2.5 py-0.5 text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 rounded-full"
											>
												<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
												<span>
													{t(
														"profile.devices.active_now",
													)}
												</span>
											</Badge>
										</div>

										<p className="text-sm font-semibold text-foreground/90 flex items-center gap-1.5">
											<span>
												{currentSession.browser}
											</span>
											<span className="text-muted-foreground">
												•
											</span>
											<span>{currentSession.os}</span>
										</p>

										<div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
											<span className="inline-flex items-center gap-1.5 font-mono">
												<Globe className="w-3.5 h-3.5 text-primary/70" />
												{currentSession.ipAddress}
											</span>
											<span className="inline-flex items-center gap-1.5">
												<Clock className="w-3.5 h-3.5 text-primary/70" />
												{t(
													"profile.devices.session_expires",
													{
														date: formatDate(
															currentSession.expiresAt,
														),
													},
												)}
											</span>
										</div>
									</div>
								</div>

								<div className="self-end sm:self-center">
									<Badge
										variant="secondary"
										className="gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground bg-background/80 border border-border/50"
									>
										<CheckCircle2 className="w-4 h-4 text-primary" />
										<span>
											{t("profile.devices.this_device")}
										</span>
									</Badge>
								</div>
							</div>
						</div>
					)}

					{/* Other Active Devices Section */}
					<div className="space-y-4 pt-2">
						<div className="flex items-center justify-between px-1">
							<h3 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
								<Globe className="w-4 h-4 text-primary" />
								<span>
									{t("profile.devices.other_devices")}
								</span>
								{otherSessions.length > 0 && (
									<span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-extrabold">
										{otherSessions.length}
									</span>
								)}
							</h3>
						</div>

						{otherSessions.length === 0 ? (
							<div className="p-8 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md text-center text-muted-foreground text-sm">
								<CheckCircle2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
								<p>{t("profile.devices.no_other_devices")}</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{otherSessions.map((session) => (
									<div
										key={session._id}
										className="p-5 md:p-6 rounded-2xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-md ring-1 ring-white/5 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between gap-4"
									>
										<div className="flex items-start justify-between gap-3">
											<div className="flex items-start gap-3.5 min-w-0">
												<div className="w-11 h-11 rounded-xl bg-secondary/80 text-foreground border border-border/50 flex items-center justify-center shrink-0 shadow-xs">
													{getDeviceIcon(
														session.deviceType,
														"w-5 h-5",
													)}
												</div>

												<div className="space-y-1 min-w-0">
													<h4 className="font-bold text-sm md:text-base text-foreground truncate">
														{session.deviceName}
													</h4>
													<p className="text-xs text-muted-foreground font-medium truncate">
														{session.browser} on{" "}
														{session.os}
													</p>
													<p className="text-[11px] font-mono text-muted-foreground/80 flex items-center gap-1.5 pt-0.5">
														<Globe className="w-3 h-3 text-primary/70" />
														<span>
															{session.ipAddress}
														</span>
													</p>
												</div>
											</div>

											<Button
												variant="ghost"
												size="sm"
												disabled={
													revokingId === session._id
												}
												onClick={() =>
													setSessionToRevoke(session)
												}
												className="h-8 px-2.5 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 cursor-pointer"
											>
												<LogOut className="w-3.5 h-3.5 mr-1" />
												<span>
													{t(
														"profile.devices.revoke",
													)}
												</span>
											</Button>
										</div>

										<div className="w-full pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
											<span className="flex items-center gap-1.5">
												<Clock className="w-3 h-3 text-muted-foreground/70" />
												{t(
													"profile.devices.last_active",
													{
														time: formatRelativeTime(
															session.lastActive,
														),
													},
												)}
											</span>
											<span>
												{t(
													"profile.devices.expires_at",
													{
														date: formatDate(
															session.expiresAt,
														),
													},
												)}
											</span>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</>
			)}

			{/* Confirm Revoke Single Session Dialog */}
			<AlertDialog
				open={!!sessionToRevoke}
				onOpenChange={(open) => !open && setSessionToRevoke(null)}
			>
				<AlertDialogContent className="border border-border/50 bg-background/90 backdrop-blur-2xl shadow-2xl rounded-2xl">
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<AlertCircle className="w-5 h-5 text-destructive" />
							<span>{t("profile.devices.revoke_session")}</span>
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("profile.devices.revoke_session_desc")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel variant="ghost">
							{t("profile.devices.cancel")}
						</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={handleRevokeSingle}
							className="font-bold cursor-pointer"
						>
							{t("profile.devices.revoke_session")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Confirm Revoke All Other Sessions Dialog */}
			<AlertDialog
				open={isRevokeAllOpen}
				onOpenChange={setIsRevokeAllOpen}
			>
				<AlertDialogContent className="border border-border/50 bg-background/90 backdrop-blur-2xl shadow-2xl rounded-2xl">
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<AlertCircle className="w-5 h-5 text-destructive" />
							<span>
								{t("profile.devices.revoke_all_others")}
							</span>
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("profile.devices.revoke_all_others_desc")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel variant="ghost">
							{t("profile.devices.cancel")}
						</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={handleRevokeAllOthers}
							className="font-bold cursor-pointer"
						>
							{t("profile.devices.revoke_all_others")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
