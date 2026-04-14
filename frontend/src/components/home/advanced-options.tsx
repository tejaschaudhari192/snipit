"use client";

import { useTranslation } from "react-i18next";
import { usePaste } from "@/context/PasteContext";
import { useAuth } from "@/context/AuthContext";
import { LogIn, Shield, Settings, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { IdTypeTabs } from "./paste-dialog/id-type-tabs";
import { BasicSettings } from "./paste-dialog/basic-settings";
import { VisibilitySelector } from "@/components/common/access-control/visibility-selector";
import { CollaboratorsManager } from "@/components/common/access-control/collaborators-manager";
import { useState, useEffect } from "react";

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
		<div className="flex items-center gap-2 text-primary/60 font-semibold text-xs tracking-wide mb-4">
			<Icon className="h-4 w-4" />
			<span>{label}</span>
		</div>
	);

	return (
		<div className="pt-2 pb-1 animate-in fade-in duration-300">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
				{/* Column 1: Identification */}
				<div className="flex flex-col">
					<SectionHeader
						icon={Tag}
						label={t("home.identification_type", "Identification")}
					/>
					<IdTypeTabs
						idTypeTab={idTypeTab}
						setIdTypeTab={setIdTypeTab}
						customId={customId}
						setCustomId={setCustomId}
						onSubmit={onSubmit}
					/>
				</div>

				{/* Column 2: General Settings */}
				<div className="flex flex-col">
					<SectionHeader
						icon={Settings}
						label={t("common.settings", "General Settings")}
					/>
					<BasicSettings
						isPasswordEnabled={isPasswordEnabled}
						setIsPasswordEnabled={setIsPasswordEnabled}
						password={password}
						setPassword={setPassword}
						allowComments={allowComments}
						setAllowComments={setAllowComments}
					/>
				</div>

				{/* Column 3: Access & Collab */}
				<div className="flex flex-col">
					<SectionHeader
						icon={Shield}
						label={t("common.privacy", "Privacy & Security")}
					/>

					<div className="flex-1 flex flex-col">
						{!user ? (
							<div className="flex flex-col justify-center items-center text-center p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5 h-full">
								<LogIn className="h-5 w-5 text-primary/50 mb-2" />
								<p className="text-primary font-bold text-sm mb-1">
									{t("common.auth_required", "Auth Required")}
								</p>
								<p className="text-xs text-muted-foreground mb-3 leading-relaxed">
									{t(
										"common.auth_required_desc",
										"Sign in to control access, visibility and collaborators.",
									)}
								</p>
								<div className="flex items-center gap-2 w-full">
									<Button
										size="sm"
										variant="outline"
										className="h-8 text-xs flex-1"
										onClick={() => navigate("/login")}
									>
										{t("header.login", "Login")}
									</Button>
									<Button
										size="sm"
										className="h-8 text-xs flex-1"
										onClick={() => navigate("/signup")}
									>
										{t("header.signup", "Sign Up")}
									</Button>
								</div>
							</div>
						) : (
							<div className="space-y-4">
								<VisibilitySelector
									visibility={visibility}
									setVisibility={setVisibility}
									publicRole={publicRole}
									setPublicRole={setPublicRole}
									setEditPermission={setEditPermission}
								/>

								<div className="pt-4 border-t border-border/10">
									<CollaboratorsManager
										shareList={shareList}
										setShareList={setShareList}
										allowedUsers={allowedUsers}
										setAllowedUsers={setAllowedUsers}
									/>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
