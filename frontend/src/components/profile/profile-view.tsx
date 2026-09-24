import { useTranslation } from "react-i18next";
import {
	User as UserIcon,
	Mail,
	KeyRound,
	Camera,
	Edit2,
	Check,
	X,
	LogOut,
	Shield,
	ExternalLink,
	Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShimmerSection } from "@/components/common/shimmer-section";
import type { User as UserType } from "@/types";

interface ProfileViewProps {
	user: UserType | null;
	isEditingName: boolean;
	setIsEditingName: (v: boolean) => void;
	newName: string;
	setNewName: (v: string) => void;
	handleUpdateName: () => void;
	isUpdating: boolean;
	onLogout: () => void;
	onOpenAvatarPicker: () => void;
}

export function ProfileView({
	user,
	isEditingName,
	setIsEditingName,
	newName,
	setNewName,
	handleUpdateName,
	isUpdating,
	onLogout,
	onOpenAvatarPicker,
}: ProfileViewProps) {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const isGuest = !user || user.email === "Guest User";
	const initials = (user?.username || "G").charAt(0).toUpperCase();

	const handleResetPasswordRedirect = () => {
		const params = new URLSearchParams();
		if (user?.email && user.email !== "Guest User") {
			params.set("email", user.email);
		}
		params.set("from", "profile");
		navigate(`/forgot-password?${params.toString()}`);
	};

	if (isGuest) {
		return (
			<div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
				{/* Header Banner */}
				<div className="p-5 md:p-6 rounded-3xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-lg ring-1 ring-white/5">
					<div className="flex items-center gap-3.5">
						<div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-xs">
							<UserIcon className="w-6 h-6" />
						</div>
						<div>
							<h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
								{t("profile.account_settings.title")}
							</h2>
							<p className="text-xs md:text-sm text-muted-foreground font-medium">
								{t("profile.account_settings.subtitle")}
							</p>
						</div>
					</div>
				</div>

				{/* Guest Info Card */}
				<div className="rounded-3xl border border-dashed border-border/70 p-8 md:p-12 text-center space-y-4 bg-card/20 max-w-lg mx-auto">
					<div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
						<Shield className="w-8 h-8" />
					</div>
					<div className="space-y-1.5">
						<h3 className="text-lg font-black text-foreground">
							{t("profile.guest_mode")}
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							{t("profile.guest_hint")}
						</p>
					</div>
					<div className="pt-2 flex justify-center gap-3">
						<Button
							onClick={() => navigate("/login")}
							className="rounded-xl px-6 font-bold cursor-pointer"
						>
							{t("header.login")}
						</Button>
						<Button
							variant="outline"
							onClick={() => navigate("/signup")}
							className="rounded-xl px-6 font-bold cursor-pointer"
						>
							{t("header.signup")}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
			{/* Header Banner - identical design pattern to DevicesView */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 rounded-3xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-lg ring-1 ring-white/5">
				<div className="flex items-center gap-3.5">
					<div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-xs">
						<UserIcon className="w-6 h-6" />
					</div>
					<div>
						<h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
							{t("profile.account_settings.title")}
						</h2>
						<p className="text-xs md:text-sm text-muted-foreground font-medium">
							{t("profile.account_settings.subtitle")}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 self-end sm:self-auto">
					<Badge
						variant="outline"
						className="px-3 py-1 text-xs font-semibold rounded-full border-primary/20 bg-primary/5 text-primary gap-1.5"
					>
						<Sparkles className="w-3.5 h-3.5" />
						<span>Snipit User</span>
					</Badge>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				{/* Personal Information & Avatar Card */}
				<div className="p-5 md:p-6 rounded-3xl border border-border/50 bg-background/50 backdrop-blur-xl shadow-sm space-y-5">
					<div>
						<h3 className="text-base font-extrabold text-foreground">
							{t("profile.account_settings.personal_info")}
						</h3>
						<p className="text-xs text-muted-foreground">
							{t("profile.account_settings.personal_info_desc")}
						</p>
					</div>

					<div className="flex items-center gap-4 pt-1">
						{/* Avatar with edit overlay */}
						<div
							onClick={onOpenAvatarPicker}
							className="relative group cursor-pointer shrink-0"
							title={t("profile.avatar.change")}
						>
							<Avatar className="h-16 w-16 rounded-2xl ring-2 ring-primary/20 bg-linear-to-br from-primary/20 via-primary/10 to-accent/20 transition-transform group-hover:scale-105">
								<AvatarImage src={user.avatar} />
								<AvatarFallback className="rounded-2xl font-black text-primary text-xl bg-primary/10">
									{initials}
								</AvatarFallback>
							</Avatar>
							<div className="absolute inset-0 rounded-2xl bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
								<Camera className="w-5 h-5 mb-0.5" />
								<span className="text-[9px] font-bold">
									Edit
								</span>
							</div>
						</div>

						{/* Username editing */}
						<div className="flex-1 min-w-0">
							<label className="text-[11px] font-semibold text-muted-foreground block mb-1">
								{t("profile.username")}
							</label>

							{isEditingName ? (
								<div className="flex items-center gap-2">
									<Input
										value={newName}
										onChange={(e) =>
											setNewName(e.target.value)
										}
										className="text-xs h-9 bg-card px-3 font-semibold rounded-xl"
										autoFocus
										onKeyDown={(e) => {
											if (e.key === "Enter")
												handleUpdateName();
											if (e.key === "Escape")
												setIsEditingName(false);
										}}
									/>
									<Button
										onClick={handleUpdateName}
										disabled={isUpdating}
										size="icon"
										className="h-9 w-9 shrink-0 rounded-xl cursor-pointer"
									>
										{isUpdating ? (
											<ShimmerSection type="mini-loader" />
										) : (
											<Check className="h-4 w-4" />
										)}
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-9 w-9 shrink-0 rounded-xl cursor-pointer"
										onClick={() => setIsEditingName(false)}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							) : (
								<div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-card/60 border border-border/40">
									<span className="font-bold text-sm text-foreground truncate pl-1">
										{user.username}
									</span>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setIsEditingName(true)}
										className="h-7 px-2.5 rounded-lg text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
									>
										<Edit2 className="h-3 w-3" />
										<span>{t("profile.edit_name")}</span>
									</Button>
								</div>
							)}
						</div>
					</div>

					{/* Avatar change button trigger */}
					<Button
						variant="outline"
						onClick={onOpenAvatarPicker}
						className="w-full h-9 rounded-xl text-xs font-semibold gap-2 border-border/50 bg-card/40 hover:bg-card cursor-pointer"
					>
						<Camera className="w-3.5 h-3.5 text-primary" />
						<span>{t("profile.avatar.change")}</span>
					</Button>
				</div>

				{/* Email & Contact Card */}
				<div className="p-5 md:p-6 rounded-3xl border border-border/50 bg-background/50 backdrop-blur-xl shadow-sm space-y-5">
					<div>
						<h3 className="text-base font-extrabold text-foreground">
							{t("profile.account_settings.email_address")}
						</h3>
						<p className="text-xs text-muted-foreground">
							{t("profile.account_settings.email_address_desc")}
						</p>
					</div>

					<div className="space-y-2">
						<label className="text-[11px] font-semibold text-muted-foreground block">
							{t("profile.email")}
						</label>
						<div className="flex items-center gap-3 p-3 rounded-2xl bg-card/60 border border-border/40">
							<div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
								<Mail className="w-4 h-4" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-bold text-foreground truncate">
									{user.email}
								</p>
								<p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
									<Check className="w-3 h-3" /> Verified
									primary email
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Security & Password Card */}
				<div className="p-5 md:p-6 rounded-3xl border border-border/50 bg-background/50 backdrop-blur-xl shadow-sm space-y-4">
					<div>
						<h3 className="text-base font-extrabold text-foreground">
							{t("profile.account_settings.security")}
						</h3>
						<p className="text-xs text-muted-foreground">
							{t("profile.account_settings.security_desc")}
						</p>
					</div>

					<div className="p-3.5 rounded-2xl bg-card/60 border border-border/40 flex items-center justify-between gap-3">
						<div className="flex items-center gap-3 min-w-0">
							<div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
								<KeyRound className="w-4 h-4" />
							</div>
							<div className="min-w-0">
								<p className="text-xs font-bold text-foreground truncate">
									{t("profile.reset_password")}
								</p>
								<p className="text-[11px] text-muted-foreground truncate">
									Receive secure password reset instructions
								</p>
							</div>
						</div>

						<Button
							variant="outline"
							size="sm"
							onClick={handleResetPasswordRedirect}
							className="h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 border-border/60 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer shrink-0"
						>
							<span>{t("profile.reset_password")}</span>
							<ExternalLink className="w-3 h-3" />
						</Button>
					</div>
				</div>

				{/* Session & Sign Out Card */}
				<div className="p-5 md:p-6 rounded-3xl border border-border/50 bg-background/50 backdrop-blur-xl shadow-sm space-y-4">
					<div>
						<h3 className="text-base font-extrabold text-foreground">
							{t("profile.account_settings.danger_zone")}
						</h3>
						<p className="text-xs text-muted-foreground">
							{t("profile.account_settings.sign_out_desc")}
						</p>
					</div>

					<div className="p-3.5 rounded-2xl bg-destructive/5 border border-destructive/20 flex items-center justify-between gap-3">
						<div className="flex items-center gap-3 min-w-0">
							<div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
								<LogOut className="w-4 h-4" />
							</div>
							<div className="min-w-0">
								<p className="text-xs font-bold text-foreground truncate">
									{t("header.logout")}
								</p>
								<p className="text-[11px] text-muted-foreground truncate">
									Sign out from this session
								</p>
							</div>
						</div>

						<Button
							variant="destructive"
							size="sm"
							onClick={onLogout}
							className="h-8 px-3.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer shrink-0"
						>
							<LogOut className="w-3.5 h-3.5 mr-1" />
							<span>{t("header.logout")}</span>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
