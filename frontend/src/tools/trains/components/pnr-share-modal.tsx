import React, { useState, useEffect } from "react";
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
import type { PnrData } from "../types/trains";
import {
	Share2,
	Mail,
	BellRing,
	Copy,
	Check,
	Plus,
	X,
	Train,
	Loader2,
	Users,
	Trash2,
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
	const { t } = useTranslation();
	const { user } = useAuth();

	const [emailInput, setEmailInput] = useState("");
	const [recipients, setRecipients] = useState<string[]>([]);
	const [subscribeAlerts, setSubscribeAlerts] = useState<boolean>(true);
	const [note, setNote] = useState("");
	const [sending, setSending] = useState(false);
	const [copied, setCopied] = useState(false);

	// Existing alert recipients already saved in DB
	const [existingRecipients, setExistingRecipients] = useState<string[]>([]);
	const [loadingExisting, setLoadingExisting] = useState(false);
	const [removingEmail, setRemovingEmail] = useState<string | null>(null);

	// Load existing recipients when opened (if user is authenticated)
	useEffect(() => {
		if (!open || !user || !ticket.pnr) return;

		let isMounted = true;
		const fetchExisting = async () => {
			try {
				setLoadingExisting(true);
				const res = await getPnrAlertRecipients(ticket.pnr);
				if (isMounted && res.success) {
					setExistingRecipients(res.alertRecipients || []);
				}
			} catch {
				// Non-blocking: ticket might not have active tracking yet
			} finally {
				if (isMounted) setLoadingExisting(false);
			}
		};

		fetchExisting();
		return () => {
			isMounted = false;
		};
	}, [open, ticket.pnr, user]);

	// Reset input state when closed
	useEffect(() => {
		if (!open) {
			setEmailInput("");
			setRecipients([]);
			setNote("");
			setCopied(false);
			setSending(false);
		}
	}, [open]);

	const addEmailFromInput = () => {
		const raw = emailInput.trim();
		if (!raw) return;

		// Support comma or space separated emails
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

	const handleSendShare = async () => {
		// Include current input if user forgot to hit Enter/Add
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
				onOpenChange(false);
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

				<div className="p-5 space-y-4 text-sm">
					{/* Ticket Summary Pill */}
					<div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 flex items-center justify-between gap-3">
						<div className="flex items-center gap-3 min-w-0">
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
									<span>•</span>
									<span>
										{ticket.departureDate || ticket.date}
									</span>
								</div>
							</div>
						</div>
						<Badge
							variant="outline"
							className="font-mono text-[11px] tracking-wider shrink-0 bg-background/80"
						>
							PNR: {ticket.pnr}
						</Badge>
					</div>

					{/* Recipient Emails Input */}
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
								placeholder="companion@example.com"
								value={emailInput}
								onChange={(e) => setEmailInput(e.target.value)}
								onKeyDown={handleKeyDown}
								className="text-xs h-9 rounded-xl"
							/>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={addEmailFromInput}
								disabled={!emailInput.trim()}
								className="h-9 px-3 rounded-xl gap-1 text-xs shrink-0 cursor-pointer"
							>
								<Plus className="h-3.5 w-3.5" />
								{t("tools.pnr_checker.add")}
							</Button>
						</div>

						{/* Chips of added recipients */}
						{recipients.length > 0 && (
							<div className="flex flex-wrap gap-1.5 pt-1">
								{recipients.map((email) => (
									<Badge
										key={email}
										variant="secondary"
										className="text-[11px] font-normal py-1 px-2.5 rounded-lg flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20"
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
									{t("tools.pnr_checker.auto_alerts_title")}
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

					{/* Previously Subscribed Alert Recipients (if any) */}
					{(loadingExisting || existingRecipients.length > 0) && (
						<div className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-2">
							<div className="flex items-center justify-between text-xs">
								<span className="font-semibold text-foreground flex items-center gap-1.5">
									<Users className="h-3.5 w-3.5 text-muted-foreground" />
									{t(
										"tools.pnr_checker.active_alert_recipients",
									)}
								</span>
								{loadingExisting ? (
									<Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
								) : (
									<Badge
										variant="outline"
										className="text-[10px] h-4"
									>
										{existingRecipients.length}
									</Badge>
								)}
							</div>
							{loadingExisting ? (
								<div className="text-xs text-muted-foreground py-1">
									{t("tools.pnr_checker.loading")}
								</div>
							) : (
								<div className="flex flex-wrap gap-1.5">
									{existingRecipients.map((email) => (
										<Badge
											key={email}
											variant="outline"
											className="text-[11px] font-normal py-0.5 px-2 rounded-md flex items-center gap-1.5 bg-background text-muted-foreground"
										>
											<span>{email}</span>
											<button
												type="button"
												onClick={() =>
													handleRemoveExisting(email)
												}
												disabled={
													removingEmail === email
												}
												className="hover:text-destructive p-0.5 cursor-pointer disabled:opacity-50"
												title={t(
													"tools.pnr_checker.stop_alerts_for",
												)}
											>
												{removingEmail === email ? (
													<Loader2 className="h-3 w-3 animate-spin" />
												) : (
													<Trash2 className="h-3 w-3" />
												)}
											</button>
										</Badge>
									))}
								</div>
							)}
						</div>
					)}
				</div>

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
						<Button
							type="button"
							variant="default"
							size="sm"
							onClick={handleSendShare}
							disabled={
								sending ||
								(recipients.length === 0 && !emailInput.trim())
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
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
