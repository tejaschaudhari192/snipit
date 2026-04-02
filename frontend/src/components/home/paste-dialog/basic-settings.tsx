import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Lock, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BasicSettingsProps {
	isPasswordEnabled: boolean;
	setIsPasswordEnabled: (v: boolean) => void;
	password: string;
	setPassword: (v: string) => void;
	allowComments: boolean;
	setAllowComments: (v: boolean) => void;
}

export const BasicSettings = ({
	isPasswordEnabled,
	setIsPasswordEnabled,
	password,
	setPassword,
	allowComments,
	setAllowComments,
}: BasicSettingsProps) => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-3">
			<div
				className="flex items-center justify-between p-3 rounded-lg border bg-card/40 hover:bg-card/80 hover:shadow-sm transition-all cursor-pointer group"
				onClick={() => {
					const newValue = !isPasswordEnabled;
					setIsPasswordEnabled(newValue);
					if (!newValue) setPassword("");
				}}
			>
				<Label
					htmlFor="password-switch"
					className="flex items-center gap-2.5 text-[13px] font-semibold cursor-pointer pointer-events-none"
				>
					<div className="p-1.5 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors">
						<Lock className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
					</div>
					{t("common.password", "Password")}
				</Label>
				<Switch
					id="password-switch"
					checked={isPasswordEnabled}
					onCheckedChange={(checked) => {
						setIsPasswordEnabled(checked);
						if (!checked) setPassword("");
					}}
				/>
			</div>

			{isPasswordEnabled && (
				<div className="animate-in slide-in-from-top-1 fade-in duration-200">
					<Input
						type="text"
						placeholder={t(
							"common.password_placeholder",
							"Enter password...",
						)}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="h-9 text-[13px] bg-card/40"
						autoFocus
					/>
				</div>
			)}

			<div
				className="flex items-center justify-between p-3 rounded-lg border bg-card/40 hover:bg-card/80 hover:shadow-sm transition-all cursor-pointer group"
				onClick={() => setAllowComments(!allowComments)}
			>
				<Label
					htmlFor="allowComments"
					className="flex items-center gap-2.5 text-[13px] font-semibold cursor-pointer pointer-events-none"
				>
					<div className="p-1.5 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors">
						<MessageCircle className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
					</div>
					{t("common.open_discussion", "Open discussion")}
				</Label>
				<Switch
					id="allowComments"
					checked={allowComments}
					onCheckedChange={(checked) => setAllowComments(checked)}
				/>
			</div>
		</div>
	);
};
