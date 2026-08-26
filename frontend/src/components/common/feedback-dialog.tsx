import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";
import { submitFeedback } from "@/lib/api/feedback";
import { FEEDBACK_OPTIONS } from "@/constants";

interface FeedbackDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

export function FeedbackDialog({ isOpen, onClose }: FeedbackDialogProps) {
	const { t } = useTranslation();
	const { user } = useAuth();

	const [type, setType] = useState<"bug" | "feature" | "general">("general");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [email, setEmail] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim() || !description.trim()) {
			toast.add({
				title: t("feedback.err_required"),
				type: "error",
			});
			return;
		}

		const payload = {
			type,
			title,
			description,
			userEmail: user?.email || email || undefined,
		};

		onClose();
		setTitle("");
		setDescription("");
		setEmail("");
		setType("general");

		submitFeedback(payload)
			.then(() => {
				toast.add({
					title: t("feedback.success"),
					type: "success",
				});
			})
			.catch((error) => {
				console.error("Failed to submit feedback:", error);
				toast.add({
					title: t("feedback.err_failed"),
					type: "error",
				});
			});
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-106.25">
				<DialogHeader>
					<DialogTitle>{t("feedback.title")}</DialogTitle>
					<DialogDescription>
						{t("feedback.description")}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 py-4">
					<div className="space-y-2">
						<Label>{t("feedback.type")}</Label>
						<Select
							value={type}
							onValueChange={(val) => val && setType(val)}
						>
							<SelectTrigger className="w-fit">
								<SelectValue className="w-fit">
									{FEEDBACK_OPTIONS.find(
										(o) => o.value === type,
									)?.labelKey &&
										t(
											FEEDBACK_OPTIONS.find(
												(o) => o.value === type,
											)!.labelKey,
										)}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								{FEEDBACK_OPTIONS.map((opt) => (
									<SelectItem
										key={opt.value}
										value={opt.value}
									>
										{t(opt.labelKey)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{!user && (
						<div className="space-y-2">
							<Label>{t("feedback.email_optional")}</Label>
							<Input
								type="email"
								placeholder={t("feedback.email_placeholder")}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
					)}

					<div className="space-y-2">
						<Label>
							{t("feedback.subject")}{" "}
							<span className="text-destructive">*</span>
						</Label>
						<Input
							placeholder={t("feedback.subject_placeholder")}
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							maxLength={100}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label>
							{t("feedback.desc")}{" "}
							<span className="text-destructive">*</span>
						</Label>
						<Textarea
							placeholder={t("feedback.desc_placeholder")}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="min-h-30 resize-y"
							required
						/>
					</div>

					<div className="pt-2 flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
						>
							{t("feedback.cancel")}
						</Button>
						<Button
							type="submit"
							disabled={!title.trim() || !description.trim()}
						>
							{t("feedback.submit")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
