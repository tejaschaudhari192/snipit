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
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/AuthContext";
import { submitFeedback } from "@/lib/api/feedback";

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
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim() || !description.trim()) {
			toast.add({
				title: t("feedback.err_required"),
				type: "error",
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const payload = {
				type,
				title,
				description,
				userEmail: user?.email || email || undefined,
			};

			await submitFeedback(payload);

			toast.add({
				title: t("feedback.success"),
				type: "success",
			});

			setTitle("");
			setDescription("");
			setEmail("");
			setType("general");
			onClose();
		} catch (error) {
			console.error("Failed to submit feedback:", error);
			toast.add({
				title: t("feedback.err_failed"),
				type: "error",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
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
							onValueChange={(val: any) => setType(val)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="bug">
									{t("feedback.type_bug")}
								</SelectItem>
								<SelectItem value="feature">
									{t("feedback.type_feature")}
								</SelectItem>
								<SelectItem value="general">
									{t("feedback.type_general")}
								</SelectItem>
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
							className="min-h-[120px] resize-y"
							required
						/>
					</div>

					<div className="pt-2 flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isSubmitting}
						>
							{t("feedback.cancel")}
						</Button>
						<Button
							type="submit"
							disabled={
								isSubmitting ||
								!title.trim() ||
								!description.trim()
							}
						>
							{isSubmitting ? (
								<>
									<Spinner className="mr-2 h-4 w-4 animate-spin" />
									{t("feedback.submitting")}
								</>
							) : (
								t("feedback.submit")
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
