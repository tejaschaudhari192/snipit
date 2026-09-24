import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";
import {
	sharePnrTicket,
	getPnrAlertRecipients,
	removePnrAlertRecipient,
} from "../api/trains";
import type { PnrData, PnrShareRecord } from "../types/trains";
import {
	Share2,
	Mail,
	BellRing,
	BellOff,
	Copy,
	Check,
	Plus,
	X,
	Train,
	Loader2,
	Users,
	RotateCcw,
	Clock,
} from "lucide-react";

interface PnrShareModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	ticket: PnrData;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PnrShareModal: React.FC<PnrShareModalProps> = ({
	open,
	onOpenChange,
	ticket,
}) => {
	const { t, i18n } = useTranslation();
	const { user, loading: authLoading } = useAuth();

	const [emailInput, setEmailInput] = useState("");
	const [recipients, setRecipients] = useState<string[]>([]);
	const [subscribeAlerts, setSubscribeAlerts] = useState<boolean>(true);
	const [sending, setSending] = useState(false);
	const [copied, setCopied] = useState(false);

	// Share history and alert recipients
	const [sharedHistory, setSharedHistory] = useState<PnrShareRecord[]>([]);
	const [existingRecipients, setExistingRecipients] = useState<string[]>([]);
	const [loadingExisting, setLoadingExisting] = useState(false);
	const [removingEmail, setRemovingEmail] = useState<string | null>(null);
	const [resendingEmail, setResendingEmail] = useState<string | null>(null);

	const storageKey = `snipit_pnr_shares_${ticket.pnr}`;

	const getLocalShares = useCallback((): PnrShareRecord[] => {
		try {
			const raw = localStorage.getItem(storageKey);
			return raw ? (JSON.parse(raw) as PnrShareRecord[]) : [];
		} catch {
			return [];
		}
	}, [storageKey]);

	const saveLocalShares = useCallback(
		(records: PnrShareRecord[]) => {
			try {
				localStorage.setItem(storageKey, JSON.stringify(records));
			} catch {
				// Local storage might be full or disabled
			}
		},
		[storageKey],
	);

	// Load share history & active alert recipients on open
	useEffect(() => {
		if (!open || !ticket.pnr) return;

		let isMounted = true;
		const localList = getLocalShares();
		setSharedHistory(localList);

		if (authLoading) return;
		if (!user) return;

		const fetchServerData = async () => {
			try {
				setLoadingExisting(true);
				const res = await getPnrAlertRecipients(ticket.pnr);
				if (!isMounted) return;
				if (!res || res.success === false) return;

				const alertRecipientsList =
					res.alertRecipients || res.recipients || [];
				setExistingRecipients(alertRecipientsList);

				// Merge server sharedWith records with local records
				const serverRecords = res.sharedWith || [];
				const map = new Map<string, PnrShareRecord>();

				for (const item of localList) {
					map.set(item.email.toLowerCase(), item);
				}
				for (const item of serverRecords) {
					const existing = map.get(item.email.toLowerCase());
					map.set(item.email.toLowerCase(), {
						email: item.email,
						sharedAt:
							item.sharedAt ||
							existing?.sharedAt ||
							new Date().toISOString(),
						alertsSubscribed: Boolean(
							item.alertsSubscribed ||
							alertRecipientsList.some(
								(r) =>
									r.toLowerCase() ===
									item.email.toLowerCase(),
							),
						),
						note: item.note || existing?.note,
					});
				}

				const merged = Array.from(map.values()).sort(
					(a, b) =>
						new Date(b.sharedAt).getTime() -
						new Date(a.sharedAt).getTime(),
				);

				setSharedHistory(merged);
				saveLocalShares(merged);
			} catch {
				// Non-blocking: ticket might not have active tracking yet
			} finally {
				if (isMounted) setLoadingExisting(false);
			}
		};

		fetchServerData();
		return () => {
			isMounted = false;
		};
	}, [open, ticket.pnr, user, authLoading, getLocalShares, saveLocalShares]);

	// Reset form state when closed
	useEffect(() => {
		if (!open) {
			setEmailInput("");
			setRecipients([]);
			setCopied(false);
			setSending(false);
		}
	}, [open]);

	const addEmailFromInput = () => {
		const raw = emailInput.trim();
		if (!raw) return;

		const parts = raw
			.split(/[\s,]+/)
			.map((e) => e.trim().toLowerCase())
			.filter(Boolean);

		const validEmails: string[] = [];
		const invalidEmails: string[] = [];

		for (const email of parts) {
			if (EMAIL_REGEX.test(email)) {
				if (
					!recipients.includes(email) &&
					!existingRecipients.includes(email)
				) {
					validEmails.push(email);
				}
			} else {
				invalidEmails.push(email);
			}
		}

		if (invalidEmails.length > 0) {
			toast.add({
				title: t("tools.pnr_checker.invalid_email_title"),
				description: invalidEmails.join(", "),
				type: "error",
			});
		}

		if (validEmails.length > 0) {
			setRecipients((prev) => [...prev, ...validEmails]);
			setEmailInput("");
		}
	};

	const removeRecipient = (emailToRemove: string) => {
		setRecipients((prev) => prev.filter((e) => e !== emailToRemove));
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			addEmailFromInput();
		}
	};

	const handleCopyLink = async () => {
		try {
			const shareUrl = `${window.location.origin}/tools/trains?pnr=${ticket.pnr}`;
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);
			toast.add({
				title: t("tools.pnr_checker.link_copied_title"),
				description: t("tools.pnr_checker.link_copied_desc"),
				type: "success",
			});
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.add({
				title: t("tools.pnr_checker.copy_failed"),
				type: "error",
			});
		}
	};

	const handleRemoveExisting = async (email: string) => {
		try {
			setRemovingEmail(email);
			const res = await removePnrAlertRecipient(ticket.pnr, email);
			if (res.success) {
				setExistingRecipients(res.alertRecipients);
				const updatedHistory = sharedHistory.map((item) =>
					item.email.toLowerCase() === email.toLowerCase()
						? { ...item, alertsSubscribed: false }
						: item,
				);
				setSharedHistory(updatedHistory);
				saveLocalShares(updatedHistory);

				toast.add({
					title: t("tools.pnr_checker.recipient_removed"),
					type: "success",
				});
			}
		} catch (err: unknown) {
			const errorMsg =
				err instanceof Error
					? err.message
					: "Failed to remove recipient";
			toast.add({
				title: errorMsg,
				type: "error",
			});
		} finally {
			setRemovingEmail(null);
		}
	};

	const handleResendTicket = async (record: PnrShareRecord) => {
		try {
			setResendingEmail(record.email);
			const res = await sharePnrTicket(ticket.pnr, {
				recipients: [record.email],
				subscribeAlerts: record.alertsSubscribed,
				ticketData: ticket,
			});

			if (res.success) {
				const nowIso = new Date().toISOString();
				const updatedHistory = sharedHistory.map((item) =>
					item.email.toLowerCase() === record.email.toLowerCase()
						? { ...item, sharedAt: nowIso }
						: item,
				);
				setSharedHistory(updatedHistory);
				saveLocalShares(updatedHistory);

				toast.add({
					title: t("tools.pnr_checker.resend_success"),
					description: t("tools.pnr_checker.resend_desc", {
						email: record.email,
					}),
					type: "success",
				});
			}
		} catch (err: unknown) {
			const errorMsg =
				err instanceof Error ? err.message : "Failed to resend ticket";
			toast.add({
				title: t("tools.pnr_checker.share_failed"),
				description: errorMsg,
				type: "error",
			});
		} finally {
			setResendingEmail(null);
		}
	};

	const handleSendShare = async () => {
		const finalRecipients = [...recipients];
		const pendingInput = emailInput.trim().toLowerCase();
		if (
			pendingInput &&
			EMAIL_REGEX.test(pendingInput) &&
			!finalRecipients.includes(pendingInput)
		) {
			finalRecipients.push(pendingInput);
			setRecipients(finalRecipients);
			setEmailInput("");
		}

		if (finalRecipients.length === 0) {
			toast.add({
				title: t("tools.pnr_checker.recipient_required"),
				description: t("tools.pnr_checker.enter_recipient_email"),
				type: "error",
			});
			return;
		}

		try {
			setSending(true);
			const res = await sharePnrTicket(ticket.pnr, {
				recipients: finalRecipients,
				subscribeAlerts,
				ticketData: ticket,
			});

			if (res.success) {
				toast.add({
					title: t("tools.pnr_checker.ticket_shared_success"),
					description: res.alertsSubscribed
						? t("tools.pnr_checker.shared_with_alerts")
						: t("tools.pnr_checker.shared_sent", {
								count: res.sentCount,
							}),
					type: "success",
				});

				// Update local share history and alert recipients
				const nowIso = new Date().toISOString();
				const historyMap = new Map<string, PnrShareRecord>();

				for (const item of sharedHistory) {
					historyMap.set(item.email.toLowerCase(), item);
				}

				for (const email of finalRecipients) {
					historyMap.set(email.toLowerCase(), {
						email,
						sharedAt: nowIso,
						alertsSubscribed: subscribeAlerts,
					});
				}

				const updatedList = Array.from(historyMap.values()).sort(
					(a, b) =>
						new Date(b.sharedAt).getTime() -
						new Date(a.sharedAt).getTime(),
				);

				setSharedHistory(updatedList);
				saveLocalShares(updatedList);

				if (subscribeAlerts) {
					setExistingRecipients((prev) =>
						Array.from(new Set([...prev, ...finalRecipients])),
					);
				}

				setRecipients([]);
				setEmailInput("");
			}
		} catch (err: unknown) {
			const errorMsg =
				err instanceof Error
					? err.message
					: "Failed to share ticket. Please try again.";
			toast.add({
				title: t("tools.pnr_checker.share_failed"),
				description: errorMsg,
				type: "error",
			});
		} finally {
			setSending(false);
		}
	};

	const formatTimestamp = (dateStr: string) => {
		try {
			const date = new Date(dateStr);
			if (Number.isNaN(date.getTime())) return dateStr;
			return date.toLocaleString(i18n.language || "en", {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return dateStr;
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[95vw] max-w-[calc(100%-1rem)] sm:max-w-135 max-h-[92vh] sm:max-h-[85vh] overflow-y-auto p-0 gap-0 rounded-2xl border-border/70 shadow-2xl bg-card">
				{/* Header */}
				<DialogHeader className="p-4 sm:p-5 pb-3 sm:pb-4 border-b border-border/50 bg-linear-to-r from-primary/10 via-primary/5 to-transparent">
					<div className="flex items-center gap-2.5">
						<div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs shrink-0">
							<Share2 className="h-4 w-4" />
						</div>
						<div className="min-w-0">
							<DialogTitle className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
								{t("tools.pnr_checker.share_ticket_title")}
							</DialogTitle>
							<DialogDescription className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1 sm:line-clamp-none">
								{t("tools.pnr_checker.share_ticket_subtitle")}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 text-sm">
					{/* Ticket Summary Pill */}
					<div className="rounded-xl border border-border/60 bg-muted/30 p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
						<div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
							<div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
								<Train className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
							</div>
							<div className="min-w-0 flex-1">
								<div className="font-semibold text-foreground text-xs truncate">
									{ticket.train}{" "}
									{ticket.trainNumber && (
										<span className="text-muted-foreground font-mono">
											(#{ticket.trainNumber})
										</span>
									)}
								</div>
								<div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
									<span className="font-medium text-foreground/80 truncate">
										{ticket.fromCode || ticket.from}
									</span>
									<span className="shrink-0">➔</span>
									<span className="font-medium text-foreground/80 truncate">
										{ticket.toCode || ticket.to}
									</span>
									{ticket.class && (
										<>
											<span className="shrink-0">•</span>
											<span className="font-medium shrink-0">
												{ticket.class}
											</span>
										</>
									)}
								</div>
							</div>
						</div>
						<Badge
							variant="secondary"
							className="font-mono text-[11px] sm:text-xs shrink-0 font-bold"
						>
							{ticket.pnr}
						</Badge>
					</div>

					{/* Recipient Input Section */}
					<div className="space-y-2">
						<label className="text-xs font-semibold text-foreground flex items-center justify-between">
							<span className="flex items-center gap-1.5">
								<Mail className="h-3.5 w-3.5 text-primary" />
								{t("tools.pnr_checker.recipient_emails_label")}
							</span>
							<span className="text-[11px] text-muted-foreground font-normal">
								{t("tools.pnr_checker.press_enter_hint")}
							</span>
						</label>

						<div className="flex gap-2">
							<Input
								type="email"
								placeholder="companion@gmail.com, family@outlook.com"
								value={emailInput}
								onChange={(e) => setEmailInput(e.target.value)}
								onKeyDown={handleKeyDown}
								className="text-xs h-9 rounded-xl min-w-0 flex-1"
							/>
							<Button
								type="button"
								onClick={addEmailFromInput}
								variant="secondary"
								size="sm"
								className="h-9 px-3 rounded-xl gap-1 text-xs shrink-0 cursor-pointer"
							>
								<Plus className="h-3.5 w-3.5" />
								{t("tools.pnr_checker.add")}
							</Button>
						</div>

						{/* Added Recipient Chips Waiting to be Sent */}
						{recipients.length > 0 && (
							<div className="flex flex-wrap gap-1.5 pt-1">
								{recipients.map((email) => (
									<Badge
										key={email}
										variant="secondary"
										className="text-xs py-1 px-2.5 rounded-lg flex items-center gap-1.5 bg-primary/10 text-primary border-primary/20 max-w-full"
									>
										<span className="truncate max-w-50 sm:max-w-none">
											{email}
										</span>
										<button
											type="button"
											onClick={() =>
												removeRecipient(email)
											}
											className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer shrink-0"
											title={t(
												"tools.pnr_checker.remove",
											)}
										>
											<X className="h-3 w-3" />
										</button>
									</Badge>
								))}
							</div>
						)}
					</div>

					{/* Automatic Status Change Alerts Switch */}
					<div className="rounded-xl border border-primary/20 bg-primary/5 p-3 sm:p-3.5 flex items-start gap-2.5 sm:gap-3 transition-colors">
						<div className="mt-0.5 shrink-0">
							<BellRing className="h-4 w-4 text-primary" />
						</div>
						<div className="flex-1 min-w-0 space-y-1">
							<div className="flex items-center justify-between gap-2">
								<span className="text-xs font-semibold text-foreground leading-tight">
									{t("tools.pnr_checker.auto_alerts_title")}
								</span>
								<Switch
									checked={subscribeAlerts}
									onCheckedChange={setSubscribeAlerts}
									aria-label="Toggle status alerts"
									className="shrink-0"
								/>
							</div>
							<p className="text-[11px] leading-relaxed text-muted-foreground">
								{t("tools.pnr_checker.auto_alerts_desc")}
							</p>
						</div>
					</div>

					{/* Shared With List (Core Snipit Pattern) */}
					{(loadingExisting || sharedHistory.length > 0) && (
						<div className="space-y-2 pt-1 border-t border-border/50">
							<div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-0.5">
								<span className="flex items-center gap-1.5">
									<Users className="h-3.5 w-3.5 text-primary" />
									{t("tools.pnr_checker.tab_shared_with", {
										count: sharedHistory.length,
									})}
								</span>
								{loadingExisting && (
									<Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
								)}
							</div>

							<div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
								{sharedHistory.map((record) => {
									const isSubscribed =
										record.alertsSubscribed ||
										existingRecipients.some(
											(r) =>
												r.toLowerCase() ===
												record.email.toLowerCase(),
										);

									return (
										<div
											key={record.email}
											className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/30 transition-colors gap-2 sm:gap-3"
										>
											{/* Top info: Avatar + Email + Timestamp */}
											<div className="flex items-center gap-2.5 min-w-0 flex-1">
												<div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 border border-primary/20">
													{record.email[0].toUpperCase()}
												</div>
												<div className="min-w-0 flex-1">
													<div
														className="text-xs font-medium text-foreground truncate"
														title={record.email}
													>
														{record.email}
													</div>
													<div className="text-[10px] text-muted-foreground flex items-center gap-1">
														<Clock className="h-2.5 w-2.5 shrink-0" />
														<span>
															{t(
																"tools.pnr_checker.shared_on",
																{
																	time: formatTimestamp(
																		record.sharedAt,
																	),
																},
															)}
														</span>
													</div>
												</div>
											</div>

											{/* Bottom row on mobile / right column on desktop: Status Badge & Actions */}
											<div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-border/40 w-full sm:w-auto">
												{isSubscribed ? (
													<Badge
														variant="outline"
														className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-semibold gap-1 py-0.5 px-2 shrink-0"
													>
														<BellRing className="h-2.5 w-2.5" />
														<span>
															{t(
																"tools.pnr_checker.alerts_active",
															)}
														</span>
													</Badge>
												) : (
													<Badge
														variant="secondary"
														className="text-[10px] text-muted-foreground gap-1 py-0.5 px-2 shrink-0"
													>
														<Check className="h-2.5 w-2.5 text-muted-foreground" />
														<span>
															{t(
																"tools.pnr_checker.ticket_sent",
															)}
														</span>
													</Badge>
												)}

												<div className="flex items-center gap-1">
													{isSubscribed && (
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() =>
																handleRemoveExisting(
																	record.email,
																)
															}
															disabled={
																removingEmail ===
																record.email
															}
															className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer gap-1"
															title={t(
																"tools.pnr_checker.stop_alerts",
															)}
														>
															{removingEmail ===
															record.email ? (
																<Loader2 className="h-3 w-3 animate-spin" />
															) : (
																<BellOff className="h-3.5 w-3.5" />
															)}
															<span className="sm:hidden text-[10px]">
																{t(
																	"tools.pnr_checker.stop_alerts",
																)}
															</span>
														</Button>
													)}

													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() =>
															handleResendTicket(
																record,
															)
														}
														disabled={
															resendingEmail ===
															record.email
														}
														className="h-7 px-2 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer gap-1"
														title={t(
															"tools.pnr_checker.resend_ticket",
														)}
													>
														{resendingEmail ===
														record.email ? (
															<Loader2 className="h-3 w-3 animate-spin" />
														) : (
															<RotateCcw className="h-3.5 w-3.5" />
														)}
														<span className="sm:hidden text-[10px]">
															{t(
																"tools.pnr_checker.resend_ticket",
															)}
														</span>
													</Button>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>

				{/* Footer Controls */}
				<div className="p-3.5 sm:p-4 border-t border-border/50 bg-muted/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2.5">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleCopyLink}
						className="w-full sm:w-auto text-xs h-9 rounded-xl gap-1.5 border-border/70 cursor-pointer order-2 sm:order-1"
					>
						{copied ? (
							<Check className="h-3.5 w-3.5 text-emerald-500" />
						) : (
							<Copy className="h-3.5 w-3.5" />
						)}
						<span>
							{copied
								? t("tools.pnr_checker.copied")
								: t("tools.pnr_checker.copy_link")}
						</span>
					</Button>

					<div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => onOpenChange(false)}
							disabled={sending}
							className="flex-1 sm:flex-initial text-xs h-9 rounded-xl cursor-pointer"
						>
							{t("tools.pnr_checker.cancel")}
						</Button>

						<Button
							type="button"
							variant="default"
							size="sm"
							onClick={handleSendShare}
							disabled={
								sending ||
								(recipients.length === 0 && !emailInput.trim())
							}
							className="flex-1 sm:flex-initial text-xs h-9 rounded-xl gap-1.5 shadow-sm cursor-pointer"
						>
							{sending ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
							) : (
								<Share2 className="h-3.5 w-3.5" />
							)}
							<span>
								{sending
									? t("tools.pnr_checker.sharing")
									: t("tools.pnr_checker.share_now")}
							</span>
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
