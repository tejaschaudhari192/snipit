"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { usePaste } from "@/context/PasteContext";
import { useAuth } from "@/context/AuthContext";
import { LogIn, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AdvancedConfigSkeleton } from "@/components/common/advanced-config-grid";

const AdvancedConfigGrid = lazy(() =>
	import("@/components/common/advanced-config-grid").then((m) => ({
		default: m.AdvancedConfigGrid,
	})),
);

interface AdvancedOptionsProps {
	onSubmit: () => void;
}

export const AdvancedOptions = ({ onSubmit }: AdvancedOptionsProps) => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const navigate = useNavigate();
	const {
		idTypeTab,
		setIdTypeTab,
		customId,
		setCustomId,
		visibility,
		setVisibility,
		password,
		setPassword,
		setEditPermission,
		shareList,
		setShareList,
		allowedUsers,
		setAllowedUsers,
		publicRole,
		setPublicRole,
		allowComments,
		setAllowComments,
	} = usePaste();

	const [isPasswordEnabled, setIsPasswordEnabled] = useState(!!password);

	useEffect(() => {
		if (password && !isPasswordEnabled) {
			setIsPasswordEnabled(true);
		}
	}, [password, isPasswordEnabled]);

	const SectionHeader = ({
		icon: Icon,
		label,
	}: {
		icon: React.ElementType;
		label: string;
	}) => (
		<div className="flex items-center gap-2 mb-4 group/header">
			<div className="p-1.5 rounded-lg bg-primary/5 text-primary group-hover/header:bg-primary group-hover/header:text-white transition-all duration-300">
				<Icon className="h-3.5 w-3.5" />
			</div>
			<span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 group-hover/header:text-primary transition-colors">
				{label}
			</span>
		</div>
	);

	if (!user) {
		return (
			<div className="pt-2 pb-1 animate-in fade-in duration-300">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="col-span-1 md:col-span-2">
						<Suspense fallback={<AdvancedConfigSkeleton />}>
							<AdvancedConfigGrid
								idTypeTab={idTypeTab}
								setIdTypeTab={setIdTypeTab}
								customId={customId}
								setCustomId={setCustomId}
								allowComments={allowComments}
								setAllowComments={setAllowComments}
								isPasswordEnabled={isPasswordEnabled}
								setIsPasswordEnabled={setIsPasswordEnabled}
								newPassword={password}
								setNewPassword={setPassword}
								visibility={visibility}
								setVisibility={setVisibility}
								publicRole={publicRole}
								setPublicRole={setPublicRole}
								setEditPermission={setEditPermission}
								allowedUsers={allowedUsers}
								setAllowedUsers={setAllowedUsers}
								shareList={shareList}
								setShareList={setShareList}
								isOwner={true}
								isAdmin={true}
								onSubmit={onSubmit}
								disabled={true}
							/>
						</Suspense>
					</div>
					<div className="flex flex-col">
						<SectionHeader
							icon={Shield}
							label={t("common.privacy")}
						/>
						<div className="flex flex-col justify-center items-center text-center p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5 min-h-[140px]">
							<LogIn className="h-5 w-5 text-primary/50 mb-2" />
							<p className="text-primary font-bold text-sm mb-1">
								{t("common.auth_required")}
							</p>
							<p className="text-xs text-muted-foreground mb-3 leading-relaxed">
								{t("common.auth_required_desc")}
							</p>
							<div className="flex items-center gap-2 w-full">
								<Button
									size="sm"
									variant="outline"
									className="h-8 text-xs flex-1"
									onClick={() => navigate("/login")}
								>
									{t("header.login")}
								</Button>
								<Button
									size="sm"
									className="h-8 text-xs flex-1"
									onClick={() => navigate("/signup")}
								>
									{t("header.signup")}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="pt-2 pb-1 animate-in fade-in duration-300">
			<Suspense fallback={<AdvancedConfigSkeleton />}>
				<AdvancedConfigGrid
					idTypeTab={idTypeTab}
					setIdTypeTab={setIdTypeTab}
					customId={customId}
					setCustomId={setCustomId}
					allowComments={allowComments}
					setAllowComments={setAllowComments}
					isPasswordEnabled={isPasswordEnabled}
					setIsPasswordEnabled={setIsPasswordEnabled}
					newPassword={password}
					setNewPassword={setPassword}
					visibility={visibility}
					setVisibility={setVisibility}
					publicRole={publicRole}
					setPublicRole={setPublicRole}
					setEditPermission={setEditPermission}
					allowedUsers={allowedUsers}
					setAllowedUsers={setAllowedUsers}
					shareList={shareList}
					setShareList={setShareList}
					isOwner={true}
					isAdmin={true}
					onSubmit={onSubmit}
				/>
			</Suspense>
		</div>
	);
};
