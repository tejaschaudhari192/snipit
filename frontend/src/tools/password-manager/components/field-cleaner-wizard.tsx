import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, RefreshCw, MailWarning, ArrowRight } from "lucide-react";
import type { PasswordItem } from "@/tools/password-manager/types";
import { useAppDispatch } from "@/tools/password-manager/store";
import { persistItem } from "@/tools/password-manager/store/thunks";

interface FieldCleanerWizardProps {
	isOpen: boolean;
	onClose: () => void;
	items: PasswordItem[];
}

export function FieldCleanerWizard({
	isOpen,
	onClose,
	items,
}: FieldCleanerWizardProps) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const [isAnalyzing, setIsAnalyzing] = useState(true);
	const [issues, setIssues] = useState<PasswordItem[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isFinished, setIsFinished] = useState(false);
	const [fixedCount, setFixedCount] = useState(0);

	useEffect(() => {
		if (!isOpen) {
			setIsAnalyzing(true);
			setIssues([]);
			setCurrentIndex(0);
			setIsFinished(false);
			setFixedCount(0);
			return;
		}

		const analyze = async () => {
			setIsAnalyzing(true);

			// Simple email regex for detection
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

			const detected = items.filter((item) => {
				if (item.itemType && item.itemType !== "login") return false;
				if (!item.username) return false;

				// If it looks like an email and metadata.email isn't already that email
				if (emailRegex.test(item.username)) {
					const existingEmail = item.metadata?.email;
					if (!existingEmail || existingEmail !== item.username) {
						return true;
					}
				}
				return false;
			});

			setIssues(detected);
			setIsAnalyzing(false);
			if (detected.length === 0) {
				setIsFinished(true);
			}
		};

		analyze();
	}, [isOpen, items]);

	const currentItem = issues[currentIndex];

	const handleApprove = async () => {
		if (!currentItem) return;

		const updatedItem = {
			...currentItem,
			username: "", // Clear username
			metadata: {
				...(currentItem.metadata || {}),
				email: currentItem.username || "",
			},
			updatedAt: new Date().toISOString(),
		};

		dispatch(persistItem(updatedItem));
		setFixedCount((prev) => prev + 1);

		handleNext();
	};

	const handleApproveAll = async () => {
		for (let i = currentIndex; i < issues.length; i++) {
			const item = issues[i];
			const updatedItem = {
				...item,
				username: "",
				metadata: {
					...(item.metadata || {}),
					email: item.username || "",
				},
				updatedAt: new Date().toISOString(),
			};
			dispatch(persistItem(updatedItem));
		}
		setFixedCount((prev) => prev + (issues.length - currentIndex));
		setIsFinished(true);
	};

	const handleNext = () => {
		if (currentIndex < issues.length - 1) {
			setCurrentIndex((prev) => prev + 1);
		} else {
			setIsFinished(true);
		}
	};

	const handleSkip = () => {
		handleNext();
	};

	const renderContent = () => {
		if (isAnalyzing) {
			return (
				<div className="flex flex-col items-center justify-center py-12 gap-4">
					<RefreshCw className="w-8 h-8 animate-spin text-primary" />
					<p className="text-muted-foreground">
						{t("tools.password_manager.analyzing_fields")}
					</p>
				</div>
			);
		}

		if (isFinished) {
			return (
				<div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
					<div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
						<CheckCircle className="w-8 h-8" />
					</div>
					<div className="space-y-1">
						<h3 className="text-lg font-semibold">
							{t("tools.password_manager.fields_cleaned")}
						</h3>
						<p className="text-sm text-muted-foreground max-w-70">
							{fixedCount > 0
								? t("tools.password_manager.fixed_count", {
										count: fixedCount,
									})
								: t("tools.password_manager.no_issues_found")}
						</p>
					</div>
				</div>
			);
		}

		return (
			<div className="flex flex-col gap-6 py-4">
				<div className="flex items-center justify-between text-sm">
					<span className="font-medium text-foreground">
						{t("tools.password_manager.review_issue")}
					</span>
					<span className="text-muted-foreground">
						{currentIndex + 1} of {issues.length}
					</span>
				</div>

				<div className="rounded-xl border border-border p-4 bg-muted/20 space-y-4">
					<div className="flex items-center gap-3 border-b border-border/50 pb-3">
						<div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
							<MailWarning className="w-5 h-5" />
						</div>
						<div className="min-w-0">
							<h4 className="font-semibold text-sm truncate">
								{currentItem.title}
							</h4>
							<p className="text-xs text-muted-foreground truncate">
								{t("tools.password_manager.email_in_username")}
							</p>
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between bg-background p-2 rounded border border-border/50 text-xs">
							<div className="flex flex-col">
								<span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
									Current (Username)
								</span>
								<span className="text-red-500 line-through">
									{currentItem.username}
								</span>
							</div>
							<ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mx-2" />
							<div className="flex flex-col items-end">
								<span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
									New (Email Field)
								</span>
								<span className="text-green-500">
									{currentItem.username}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{t("tools.password_manager.clean_fields")}
					</DialogTitle>
					<DialogDescription>
						{t("tools.password_manager.clean_fields_desc")}
					</DialogDescription>
				</DialogHeader>

				{renderContent()}

				<DialogFooter className="mt-4 flex flex-wrap gap-2 sm:justify-end">
					{!isAnalyzing && !isFinished && (
						<>
							<Button variant="ghost" onClick={handleSkip}>
								{t("tools.password_manager.skip")}
							</Button>
							{issues.length > 1 && (
								<Button
									variant="outline"
									onClick={handleApproveAll}
								>
									{t("tools.password_manager.approve_all")}
								</Button>
							)}
							<Button onClick={handleApprove} className="gap-2">
								{t("tools.password_manager.approve")}
							</Button>
						</>
					)}
					{isFinished && (
						<Button onClick={onClose} className="w-full">
							{t("tools.password_manager.done")}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
