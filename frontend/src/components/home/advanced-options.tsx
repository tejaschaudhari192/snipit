"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { usePaste } from "@/context/PasteContext";
import { useAuth } from "@/context/AuthContext";
import { LogIn, Shield, Settings, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { IdTypeTabs } from "./paste-dialog/id-type-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LabelManager } from "@/components/common/label-manager";

const BasicSettings = lazy(() =>
	import("./paste-dialog/basic-settings").then((m) => ({
		default: m.BasicSettings,
	})),
);

const VisibilitySelector = lazy(() =>
	import("@/components/common/access-control/visibility-selector").then(
		(m) => ({ default: m.VisibilitySelector }),
	),
);

const CollaboratorsManager = lazy(() =>
	import("@/components/common/access-control/collaborators-manager").then(
		(m) => ({ default: m.CollaboratorsManager }),
	),
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
						label={t("home.identification_type")}
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
				<div className="flex flex-col space-y-4">
					<div className="flex flex-col">
						<SectionHeader
							icon={Settings}
							label={t("common.settings")}
						/>
						<Suspense
							fallback={
								<div className="flex flex-col gap-3">
									<Skeleton className="h-[46px] w-full rounded-lg" />
									<Skeleton className="h-[46px] w-full rounded-lg" />
								</div>
							}
						>
							<BasicSettings
								isPasswordEnabled={isPasswordEnabled}
								setIsPasswordEnabled={setIsPasswordEnabled}
								password={password}
								setPassword={setPassword}
								allowComments={allowComments}
								setAllowComments={setAllowComments}
							/>
						</Suspense>
					</div>

					{user && (
						<div className="pt-2">
							<LabelManager />
						</div>
					)}
				</div>

				{/* Column 3: Access & Collab */}
				<div className="flex flex-col">
					<SectionHeader icon={Shield} label={t("common.privacy")} />

					<div className="flex flex-col">
						{!user ? (
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
						) : (
							<div className="space-y-4">
								<Suspense
									fallback={
										<Skeleton className="h-[62px] w-full rounded-lg" />
									}
								>
									<VisibilitySelector
										visibility={visibility}
										setVisibility={setVisibility}
										publicRole={publicRole}
										setPublicRole={setPublicRole}
										setEditPermission={setEditPermission}
									/>
								</Suspense>

								<div className="pt-4 border-t border-border/10">
									<Suspense
										fallback={
											<Skeleton className="h-[46px] w-full rounded-lg" />
										}
									>
										<CollaboratorsManager
											shareList={shareList}
											setShareList={setShareList}
											allowedUsers={allowedUsers}
											setAllowedUsers={setAllowedUsers}
										/>
									</Suspense>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
