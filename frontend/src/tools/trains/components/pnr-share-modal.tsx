import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
	Send,
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
	const { user } = useAuth();

	const [activeTab, setActiveTab] = useState<string>("share");
	const [emailInput, setEmailInput] = useState("");
	const [recipients, setRecipients] = useState<string[]>([]);
	const [subscribeAlerts, setSubscribeAlerts] = useState<boolean>(true);
	const [note, setNote] = useState("");
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

		if (!user) return;

		const fetchServerData = async () => {
			try {
				setLoadingExisting(true);
				const res = await getPnrAlertRecipients(ticket.pnr);
				if (!isMounted || !res.success) return;

				setExistingRecipients(res.alertRecipients || []);

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
							res.alertRecipients?.some(
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
	}, [open, ticket.pnr, user, getLocalShares, saveLocalShares]);

	// Reset form state when closed
	useEffect(() => {
		if (!open) {
			setEmailInput("");
			setRecipients([]);
			setNote("");
			setCopied(false);
			setSending(false);
			setActiveTab("share");
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
				note: record.note,
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
				note: note.trim() || undefined,
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
						note: note.trim() || undefined,
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
				setNote("");
				setActiveTab("shared_with");
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
			<DialogContent className="sm:max-w-135 max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-border/70 shadow-2xl bg-card">
				{/* Header */}
				<DialogHeader className="p-5 pb-4 border-b border-border/50 bg-linear-to-r from-primary/10 via-primary/5 to-transparent">
					<div className="flex items-center gap-2.5">
						<div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
							<Share2 className="h-4 w-4" />
						</div>
						<div>
							<DialogTitle className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
								{t("tools.pnr_checker.share_ticket_title")}
							</DialogTitle>
							<DialogDescription className="text-xs text-muted-foreground mt-0.5">
								{t("tools.pnr_checker.share_ticket_subtitle")}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="w-full flex flex-col"
				>
					{/* Navigation Tabs Header */}
					<div className="px-5 pt-3 border-b border-border/50 bg-muted/15 flex items-center justify-between">
						<TabsList className="bg-muted/60 border border-border/40 p-1 rounded-xl h-9">
							<TabsTrigger
								value="share"
								className="text-xs font-semibold px-3 py-1 gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs cursor-pointer"
							>
								<Send className="h-3.5 w-3.5" />
								<span>{t("tools.pnr_checker.tab_share")}</span>
							</TabsTrigger>
							<TabsTrigger
								value="shared_with"
								className="text-xs font-semibold px-3 py-1 gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs cursor-pointer"
							>
								<Users className="h-3.5 w-3.5" />
								<span>
									{t("tools.pnr_checker.tab_shared_with", {
										count: sharedHistory.length,
									})}
								</span>
							</TabsTrigger>
						</TabsList>

						{sharedHistory.length > 0 && activeTab === "share" && (
							<button
								type="button"
								onClick={() => setActiveTab("shared_with")}
								className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer transition-colors"
							>
								<Users className="h-3 w-3" />
								<span>
									{t(
										"tools.pnr_checker.already_shared_badge",
										{
											count: sharedHistory.length,
										},
									)}
								</span>
							</button>
						)}
					</div>

					{/* Tab 1: Share Ticket Form */}
					<TabsContent
						value="share"
						className="p-5 space-y-4 text-sm mt-0 outline-none"
					>
						{/* Ticket Summary Pill */}
						<div className="rounded-xl border border-border/60 bg-muted/30 p-3 flex items-center justify-between gap-3">
							<div className="flex items-center gap-2.5 min-w-0">
								<div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
									<Train className="h-4 w-4" />
								</div>
								<div className="min-w-0">
									<div className="font-semibold text-foreground text-xs truncate">
										{ticket.train}{" "}
										{ticket.trainNumber && (
											<span className="text-muted-foreground font-mono">
												(#{ticket.trainNumber})
											</span>
										)}
									</div>
									<div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
										<span className="font-medium text-foreground/80">
											{ticket.fromCode || ticket.from}
										</span>
										<span>➔</span>
										<span className="font-medium text-foreground/80">
											{ticket.toCode || ticket.to}
										</span>
										{ticket.class && (
											<>
												<span>•</span>
												<span className="font-medium">
													{ticket.class}
												</span>
											</>
										)}
									</div>
								</div>
							</div>
							<Badge
								variant="secondary"
								className="font-mono text-xs shrink-0 font-bold"
							>
								{ticket.pnr}
							</Badge>
						</div>

						{/* Recipient Input Section */}
						<div className="space-y-2">
							<label className="text-xs font-semibold text-foreground flex items-center justify-between">
								<span className="flex items-center gap-1.5">
									<Mail className="h-3.5 w-3.5 text-primary" />
									{t(
										"tools.pnr_checker.recipient_emails_label",
									)}
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
									onChange={(e) =>
										setEmailInput(e.target.value)
									}
									onKeyDown={handleKeyDown}
									className="text-xs h-9 rounded-xl"
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

							{/* Added Recipient Chips */}
							{recipients.length > 0 && (
								<div className="flex flex-wrap gap-1.5 pt-1">
									{recipients.map((email) => (
										<Badge
											key={email}
											variant="secondary"
											className="text-xs py-1 px-2.5 rounded-lg flex items-center gap-1.5 bg-primary/10 text-primary border-primary/20"
										>
											<span>{email}</span>
											<button
												type="button"
												onClick={() =>
													removeRecipient(email)
												}
												className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
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
						<div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex items-start gap-3 transition-colors">
							<div className="mt-0.5">
								<BellRing className="h-4 w-4 text-primary" />
							</div>
							<div className="flex-1 space-y-1">
								<div className="flex items-center justify-between gap-2">
									<span className="text-xs font-semibold text-foreground">
										{t(
											"tools.pnr_checker.auto_alerts_title",
										)}
									</span>
									<Switch
										checked={subscribeAlerts}
										onCheckedChange={setSubscribeAlerts}
										aria-label="Toggle status alerts"
									/>
								</div>
								<p className="text-[11px] leading-relaxed text-muted-foreground">
									{t("tools.pnr_checker.auto_alerts_desc")}
								</p>
							</div>
						</div>

						{/* Optional Message / Note */}
						<div className="space-y-1.5">
							<label className="text-xs font-medium text-muted-foreground">
								{t("tools.pnr_checker.optional_note_label")}
							</label>
							<Textarea
								placeholder={t(
									"tools.pnr_checker.optional_note_placeholder",
								)}
								value={note}
								onChange={(e) => setNote(e.target.value)}
								rows={2}
								className="text-xs resize-none rounded-xl"
								maxLength={250}
							/>
						</div>
					</TabsContent>

					{/* Tab 2: Shared With List */}
					<TabsContent
						value="shared_with"
						className="p-5 space-y-3 text-sm mt-0 outline-none"
					>
						{loadingExisting ? (
							<div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
								<Loader2 className="h-6 w-6 animate-spin text-primary" />
								<span className="text-xs">
									{t("tools.pnr_checker.loading")}
								</span>
							</div>
						) : sharedHistory.length === 0 ? (
							<div className="py-10 px-4 rounded-2xl border border-dashed border-border/70 text-center flex flex-col items-center justify-center gap-3 bg-muted/10">
								<div className="h-10 w-10 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
									<Users className="h-5 w-5" />
								</div>
								<div className="space-y-1 max-w-xs">
									<div className="text-xs font-bold text-foreground">
										{t("tools.pnr_checker.no_shares_yet")}
									</div>
									<div className="text-[11px] text-muted-foreground leading-relaxed">
										{t("tools.pnr_checker.no_shares_desc")}
									</div>
								</div>
								<Button
									type="button"
									variant="secondary"
									size="sm"
									onClick={() => setActiveTab("share")}
									className="text-xs h-8 gap-1.5 rounded-xl cursor-pointer"
								>
									<Send className="h-3 w-3" />
									<span>
										{t("tools.pnr_checker.switch_to_share")}
									</span>
								</Button>
							</div>
						) : (
							<div className="space-y-2 max-h-72 overflow-y-auto pr-1">
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
											className="p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/30 transition-colors flex flex-col gap-2"
										>
											<div className="flex items-center justify-between gap-2">
												<div className="flex items-center gap-2 min-w-0">
													<div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
														{record.email
															.charAt(0)
															.toUpperCase()}
													</div>
													<div className="min-w-0">
														<div className="text-xs font-semibold text-foreground truncate">
															{record.email}
														</div>
														<div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
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

												{/* Status Badge */}
												<div className="shrink-0">
													{isSubscribed ? (
														<Badge
															variant="outline"
															className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-semibold gap-1 py-0.5 px-2"
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
															className="text-[10px] text-muted-foreground gap-1 py-0.5 px-2"
														>
															<Check className="h-2.5 w-2.5 text-muted-foreground" />
															<span>
																{t(
																	"tools.pnr_checker.ticket_sent",
																)}
															</span>
														</Badge>
													)}
												</div>
											</div>

											{/* Note Preview if present */}
											{record.note && (
												<div className="text-[11px] text-muted-foreground bg-background/60 p-2 rounded-lg border border-border/40 italic line-clamp-2">
													"{record.note}"
												</div>
											)}

											{/* Item Action Controls */}
											<div className="flex items-center justify-end gap-1.5 pt-1 border-t border-border/30">
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
														className="text-[11px] h-7 px-2 text-destructive hover:bg-destructive/10 gap-1 rounded-lg cursor-pointer"
													>
														{removingEmail ===
														record.email ? (
															<Loader2 className="h-3 w-3 animate-spin" />
														) : (
															<BellOff className="h-3 w-3" />
														)}
														<span>
															{t(
																"tools.pnr_checker.stop_alerts",
															)}
														</span>
													</Button>
												)}

												<Button
													type="button"
													variant="outline"
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
													className="text-[11px] h-7 px-2.5 gap-1 rounded-lg border-border/70 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
												>
													{resendingEmail ===
													record.email ? (
														<Loader2 className="h-3 w-3 animate-spin" />
													) : (
														<RotateCcw className="h-3 w-3 text-primary" />
													)}
													<span>
														{t(
															"tools.pnr_checker.resend_ticket",
														)}
													</span>
												</Button>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</TabsContent>
				</Tabs>

				{/* Footer Controls */}
				<div className="p-4 border-t border-border/50 bg-muted/20 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleCopyLink}
						className="w-full sm:w-auto text-xs h-9 rounded-xl gap-1.5 border-border/70 cursor-pointer"
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

					<div className="flex items-center gap-2 w-full sm:w-auto justify-end">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => onOpenChange(false)}
							disabled={sending}
							className="text-xs h-9 rounded-xl cursor-pointer"
						>
							{t("tools.pnr_checker.cancel")}
						</Button>

						{activeTab === "share" ? (
							<Button
								type="button"
								variant="default"
								size="sm"
								onClick={handleSendShare}
								disabled={
									sending ||
									(recipients.length === 0 &&
										!emailInput.trim())
								}
								className="w-full sm:w-auto text-xs h-9 rounded-xl gap-1.5 shadow-sm cursor-pointer"
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
						) : (
							<Button
								type="button"
								variant="default"
								size="sm"
								onClick={() => setActiveTab("share")}
								className="w-full sm:w-auto text-xs h-9 rounded-xl gap-1.5 shadow-sm cursor-pointer"
							>
								<Plus className="h-3.5 w-3.5" />
								<span>{t("tools.pnr_checker.tab_share")}</span>
							</Button>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
