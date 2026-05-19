"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { usePaste } from "@/context/PasteContext";
import { useAuth } from "@/context/AuthContext";
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
	const { user } = useAuth();
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
		collaborators,
		setCollaborators,
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

	if (!user) {
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
						collaborators={collaborators}
						setCollaborators={setCollaborators}
						isOwner={true}
						isAdmin={true}
						onSubmit={onSubmit}
						disabled={true}
					/>
				</Suspense>
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
					collaborators={collaborators}
					setCollaborators={setCollaborators}
					isOwner={true}
					isAdmin={true}
					onSubmit={onSubmit}
				/>
			</Suspense>
		</div>
	);
};
