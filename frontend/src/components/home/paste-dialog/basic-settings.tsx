import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Lock, Users, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BasicSettingsProps {
	isPasswordEnabled: boolean;
	setIsPasswordEnabled: (v: boolean) => void;
	password: string;
	setPassword: (v: string) => void;
	allowComments: boolean;
	setAllowComments: (v: boolean) => void;
	fastRedirect: boolean;
	setFastRedirect: (v: boolean) => void;
	contentType: "text" | "code" | "link" | "file";
}

export const BasicSettings = ({
	isPasswordEnabled,
	setIsPasswordEnabled,
	password,
	setPassword,
	allowComments,
	setAllowComments,
	fastRedirect,
	setFastRedirect,
	contentType,
}: BasicSettingsProps) => {
	const { t } = useTranslation();

	return (
		<div className="space-y-3 mb-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div
					className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-all cursor-pointer group shadow-sm"
					onClick={() => {
						const newValue = !isPasswordEnabled;
						setIsPasswordEnabled(newValue);
						if (!newValue) setPassword("");
					}}
				>
					<Label
						htmlFor="password-switch"
						className="flex items-center gap-2 text-sm font-medium cursor-pointer pointer-events-none"
					>
						<Lock className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
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

				<div
					className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-all cursor-pointer group shadow-sm"
					onClick={() => setAllowComments(!allowComments)}
				>
					<Label
						htmlFor="allowComments"
						className="flex items-center gap-2 text-sm font-medium cursor-pointer pointer-events-none"
					>
						<Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
						{t("common.open_discussion", "Open discussion")}
					</Label>
					<Switch
						id="allowComments"
						checked={allowComments}
						onCheckedChange={(checked) => setAllowComments(checked)}
					/>
				</div>
			</div>

			{contentType !== "file" && (
				<div
					className="flex items-center justify-between p-3.5 rounded-xl border bg-card hover:bg-muted/50 transition-all cursor-pointer group"
					onClick={() => setFastRedirect(!fastRedirect)}
				>
					<div className="flex items-center gap-2.5">
						<div className="p-2 rounded-full bg-yellow-500/10 text-yellow-500 group-hover:scale-110 transition-transform">
							<Zap className="h-4 w-4 fill-current" />
						</div>
						<div className="flex flex-col">
							<Label
								htmlFor="fast-redirect"
								className="text-sm font-bold cursor-pointer pointer-events-none"
							>
								{t(
									"common.fast_redirection",
									"Fast Redirection",
								)}
							</Label>
							<span className="text-[10px] text-muted-foreground font-medium pr-8">
								{t(
									"common.fast_redirection_desc",
									"Directly opens the content when the link is reached.",
								)}
							</span>
						</div>
					</div>
					<Switch
						id="fast-redirect"
						checked={fastRedirect}
						onCheckedChange={setFastRedirect}
					/>
				</div>
			)}

			{isPasswordEnabled && (
				<div className="animate-in slide-in-from-top-2 fade-in duration-200">
					<Input
						type="text"
						placeholder={t(
							"common.password_placeholder",
							"Enter password...",
						)}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="h-11"
						autoFocus
					/>
				</div>
			)}
		</div>
	);
};
