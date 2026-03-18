import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Clock } from "lucide-react";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useTranslation } from "react-i18next";

interface CustomExpiryDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	customExpiryDate: Date | undefined;
	setCustomExpiryDate: (date: Date | undefined) => void;
	onConfirm: (date: Date) => void;
}

export const CustomExpiryDialog = ({
	isOpen,
	onOpenChange,
	customExpiryDate,
	setCustomExpiryDate,
	onConfirm,
}: CustomExpiryDialogProps) => {
	const { t } = useTranslation();

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md border border-border/50 bg-background/60 backdrop-blur-2xl shadow-2xl rounded-2xl ring-1 ring-white/5 overflow-hidden">
				<DialogHeader>
					<div className="flex items-center gap-2 mb-1">
						<div className="p-2 rounded-lg bg-primary/10 text-primary">
							<Clock className="h-5 w-5" />
						</div>
						<DialogTitle>
							{t("home.expire_options.custom")}
						</DialogTitle>
					</div>
					<p className="text-sm text-muted-foreground">
						Choose a specific date and time for this snippet to
						expire.
					</p>
				</DialogHeader>

				<div className="py-4">
					<DateTimePicker
						date={customExpiryDate}
						setDate={setCustomExpiryDate}
					/>
				</div>

				<DialogFooter className="sm:justify-between gap-2">
					<Button variant="ghost" onClick={() => onOpenChange(false)}>
						{t("home.dynamic_id_dialog.cancel")}
					</Button>
					<Button
						onClick={() => {
							if (customExpiryDate) {
								onConfirm(customExpiryDate);
							}
						}}
						disabled={!customExpiryDate}
						className="px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold"
					>
						Set Expiry
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
