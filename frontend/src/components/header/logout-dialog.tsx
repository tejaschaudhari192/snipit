import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogMedia,
} from "@/components/ui/alert-dialog";

interface LogoutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const LogoutDialog = ({ open, onOpenChange }: LogoutDialogProps) => {
	const { logout } = useAuth();
	const { t } = useTranslation();

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent
				size="sm"
				className="border border-border/50 bg-background/60 backdrop-blur-2xl shadow-2xl rounded-2xl ring-1 ring-white/5 overflow-hidden"
			>
				<AlertDialogHeader>
					<AlertDialogMedia className="bg-destructive/10 text-destructive">
						<LogOut className="h-8 w-8" />
					</AlertDialogMedia>
					<AlertDialogTitle>
						{t("auth.logout_action", "Logout")}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{t(
							"auth.logout_confirm_question",
							"Are you sure you want to logout?",
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel variant="ghost">
						{t("auth.logout_cancel", "Cancel")}
					</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={async () => {
							await logout();
							toast.success(
								t("auth.logout_confirm", "Logged out"),
							);
						}}
						className="font-bold"
					>
						{t("auth.logout_action", "Logout")}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
