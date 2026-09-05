import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
	Bell,
	BellOff,
	BellRing,
	Clock,
	CheckCircle2,
	AlertCircle,
	Loader2,
	LogIn,
	Sparkles,
} from "lucide-react";
import {
	getPnrTrackingStatus,
	subscribePnrTracking,
	unsubscribePnrTracking,
} from "../api/trains";
import type { PnrTrackingItem } from "../types/trains";

interface PnrTrackerCardProps {
	pnr: string;
}

export const PnrTrackerCard: React.FC<PnrTrackerCardProps> = ({ pnr }) => {
	const { t } = useTranslation();
	const { user, loading: authLoading } = useAuth();

	const [isTracking, setIsTracking] = useState(false);
	const [trackingData, setTrackingData] = useState<PnrTrackingItem | null>(
		null,
	);
	const [statusLoading, setStatusLoading] = useState(false);
	const [actionLoading, setActionLoading] = useState(false);
	const [feedbackMsg, setFeedbackMsg] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const fetchStatus = useCallback(async () => {
		if (!user || !pnr || pnr.length !== 10) return;
		setStatusLoading(true);
		try {
			const res = await getPnrTrackingStatus(pnr);
			const active = Boolean(res.isTracking ?? res.isTracked);
			setIsTracking(active);
			setTrackingData(res.tracking || null);
		} catch (err) {
			console.error("Failed to check PNR tracking status:", err);
		} finally {
			setStatusLoading(false);
		}
	}, [user, pnr]);

	useEffect(() => {
		if (!authLoading && user) {
			fetchStatus();
		}
	}, [authLoading, user, fetchStatus]);

	const handleSubscribe = async () => {
		if (!user) return;
		setActionLoading(true);
		setFeedbackMsg(null);
		try {
			const res = await subscribePnrTracking(pnr);
			setIsTracking(true);
			setTrackingData(res.tracking);
			setFeedbackMsg({
				type: "success",
				text: t("tools.pnr_checker.tracker.success_enabled"),
			});
		} catch (err: unknown) {
			const axiosErr = err as {
				response?: { data?: { error?: string } };
				message?: string;
			};
			const msg =
				axiosErr?.response?.data?.error ||
				axiosErr?.message ||
				t("tools.pnr_checker.tracker.err_subscribe");
			setFeedbackMsg({ type: "error", text: msg });
		} finally {
			setActionLoading(false);
		}
	};

	const handleUnsubscribe = async () => {
		if (!user) return;
		setActionLoading(true);
		setFeedbackMsg(null);
		try {
			await unsubscribePnrTracking(pnr);
			setIsTracking(false);
			setTrackingData(null);
			setFeedbackMsg({
				type: "success",
				text: t("tools.pnr_checker.tracker.success_stopped"),
			});
		} catch (err: unknown) {
			const axiosErr = err as {
				response?: { data?: { error?: string } };
				message?: string;
			};
			const msg =
				axiosErr?.response?.data?.error ||
				axiosErr?.message ||
				t("tools.pnr_checker.tracker.err_unsubscribe");
			setFeedbackMsg({ type: "error", text: msg });
		} finally {
			setActionLoading(false);
		}
	};

	// 1. Loading state (auth resolving or initial status check)
	if (
		authLoading ||
		(user && statusLoading && !trackingData && !isTracking)
	) {
		return (
			<div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-4 sm:p-5 shadow-sm animate-pulse">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div className="flex items-start gap-3.5 w-full max-w-sm">
						<div className="h-10 w-10 rounded-xl bg-muted shrink-0" />
						<div className="space-y-2 w-full">
							<div className="h-4 bg-muted rounded w-1/2" />
							<div className="h-3 bg-muted/60 rounded w-3/4" />
						</div>
					</div>
					<div className="h-9 w-28 bg-muted rounded-xl shrink-0 self-end sm:self-center" />
				</div>
			</div>
		);
	}

	// 2. Unauthenticated / Guest view
	if (!user) {
		return (
			<div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 p-4 sm:p-5 shadow-sm">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div className="flex items-start gap-3">
						<div className="rounded-xl bg-primary/10 p-2.5 text-primary">
							<BellRing className="h-5 w-5" />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<h4 className="text-sm font-bold text-foreground">
									{t("tools.pnr_checker.tracker.title")}
								</h4>
								<Badge
									variant="outline"
									className="text-[10px] font-semibold text-primary border-primary/30"
								>
									{t("tools.pnr_checker.tracker.badge_free")}
								</Badge>
							</div>
							<p className="text-xs text-muted-foreground mt-0.5 max-w-md">
								{t("tools.pnr_checker.tracker.guest_desc")}
							</p>
						</div>
					</div>

					<Link
						to={`/login?redirect=${encodeURIComponent("/tools/trains")}`}
						className="shrink-0"
					>
						<Button
							size="sm"
							variant="default"
							className="h-9 px-4 gap-2 text-xs font-semibold rounded-xl shadow-sm whitespace-nowrap cursor-pointer"
						>
							<LogIn className="h-3.5 w-3.5 shrink-0" />
							<span>
								{t("tools.pnr_checker.tracker.sign_in_btn")}
							</span>
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	// 3. Active tracking view
	if (isTracking) {
		return (
			<div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 p-4 sm:p-5 shadow-sm transition-all">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div className="flex items-start gap-3.5">
						<div className="relative rounded-xl bg-emerald-500/15 p-2.5 text-emerald-600 dark:text-emerald-400">
							<Bell className="h-5 w-5" />
							<span className="absolute top-1 right-1 flex h-2.5 w-2.5">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
							</span>
						</div>
						<div>
							<div className="flex items-center gap-2">
								<h4 className="text-sm font-bold text-foreground">
									{t(
										"tools.pnr_checker.tracker.active_title",
									)}
								</h4>
								<Badge className="bg-emerald-600 text-white hover:bg-emerald-600 text-[10px] px-2 py-0.5">
									{t("tools.pnr_checker.tracker.badge_live")}
								</Badge>
							</div>
							<p className="text-xs text-muted-foreground mt-0.5">
								{t("tools.pnr_checker.tracker.active_desc", {
									email: user.email,
								})}
							</p>
							{trackingData?.nextCheckAt && (
								<div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1.5">
									<Clock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
									<span>
										{t(
											"tools.pnr_checker.tracker.next_check",
											{
												time: new Date(
													trackingData.nextCheckAt,
												).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												}),
											},
										)}
									</span>
								</div>
							)}
						</div>
					</div>

					<div className="flex items-center gap-2 self-end sm:self-center">
						<Button
							size="sm"
							variant="outline"
							className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 gap-1.5 rounded-xl"
							onClick={handleUnsubscribe}
							disabled={actionLoading}
						>
							{actionLoading ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
							) : (
								<BellOff className="h-3.5 w-3.5" />
							)}
							<span>
								{t(
									"tools.pnr_checker.tracker.stop_tracking_btn",
								)}
							</span>
						</Button>
					</div>
				</div>

				{feedbackMsg && (
					<div
						className={`mt-3 flex items-center gap-2 text-xs font-medium rounded-lg px-3 py-1.5 ${
							feedbackMsg.type === "success"
								? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
								: "bg-destructive/15 text-destructive"
						}`}
					>
						{feedbackMsg.type === "success" ? (
							<CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
						) : (
							<AlertCircle className="h-3.5 w-3.5 shrink-0" />
						)}
						<span>{feedbackMsg.text}</span>
					</div>
				)}
			</div>
		);
	}

	// 3. Logged-in but not currently tracking this PNR
	return (
		<div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:border-primary/40 transition-colors">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-start gap-3.5">
					<div className="rounded-xl bg-primary/10 p-2.5 text-primary">
						<Sparkles className="h-5 w-5" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h4 className="text-sm font-bold text-foreground">
								{t("tools.pnr_checker.tracker.cta_title")}
							</h4>
							<Badge
								variant="secondary"
								className="text-[10px] font-medium"
							>
								{t("tools.pnr_checker.tracker.badge_hourly")}
							</Badge>
						</div>
						<p className="text-xs text-muted-foreground mt-0.5 max-w-lg">
							{t("tools.pnr_checker.tracker.cta_desc", {
								email: user.email,
							})}
						</p>
					</div>
				</div>

				<Button
					size="sm"
					className="shrink-0 gap-2 h-9 text-xs rounded-xl shadow-sm"
					onClick={handleSubscribe}
					disabled={actionLoading || statusLoading}
				>
					{actionLoading ? (
						<Loader2 className="h-3.5 w-3.5 animate-spin" />
					) : (
						<Bell className="h-3.5 w-3.5" />
					)}
					<span>
						{t("tools.pnr_checker.tracker.enable_alerts_btn")}
					</span>
				</Button>
			</div>

			{feedbackMsg && (
				<div
					className={`mt-3 flex items-center gap-2 text-xs font-medium rounded-lg px-3 py-1.5 ${
						feedbackMsg.type === "success"
							? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
							: "bg-destructive/15 text-destructive"
					}`}
				>
					{feedbackMsg.type === "success" ? (
						<CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
					) : (
						<AlertCircle className="h-3.5 w-3.5 shrink-0" />
					)}
					<span>{feedbackMsg.text}</span>
				</div>
			)}
		</div>
	);
};
