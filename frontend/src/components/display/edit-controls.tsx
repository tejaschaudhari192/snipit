import { lazy, Suspense } from "react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

import { AdvancedConfigSkeleton } from "@/components/common/advanced-config-grid";

const AdvancedConfigGrid = lazy(() =>
	import("@/components/common/advanced-config-grid").then((m) => ({
		default: m.AdvancedConfigGrid,
	})),
);

import type {
	ContentMode,
	Visibility,
	EditPermission,
	PublicRole,
	ShareRole,
	AiIdFileContext,
} from "@/types";

interface EditControlsProps {
	pasteId?: string;
	contentType: ContentMode;
	setContentType: (v: ContentMode) => void;
	language: string;
	setLanguage: (v: string) => void;
	visibility: Visibility;
	setVisibility: (v: Visibility) => void;
	allowedUsers: string[];
	setAllowedUsers: (v: string[]) => void;
	isDetecting: boolean;
	onAutoDetect: () => void;
	newPassword: string;
	setNewPassword: (v: string) => void;
	isPasswordEnabled: boolean;
	setIsPasswordEnabled: (v: boolean) => void;
	editPermission: EditPermission;
	setEditPermission: (v: EditPermission) => void;
	isOwner: boolean;
	isAdmin: boolean;
	collaborators: {
		email: string;
		role: ShareRole;
	}[];
	setCollaborators: (
		v: {
			email: string;
			role: ShareRole;
		}[],
	) => void;
	publicRole: PublicRole;
	setPublicRole: (v: PublicRole) => void;
	allowComments: boolean;
	setAllowComments: (v: boolean) => void;
	idTypeTab: "system" | "dynamic" | "semantic";
	setIdTypeTab: (v: "system" | "dynamic" | "semantic") => void;
	customId: string;
	setCustomId: (v: string) => void;
	isOptionsOpen: boolean;
	setIsOptionsOpen: (v: boolean) => void;
	textValue?: string;
	files?: AiIdFileContext[];
	onSubmit?: () => void;
	originalPasswordProtected?: boolean;
}

export const EditControls = (props: EditControlsProps) => {
	return (
		<div className="flex flex-col w-full animate-in fade-in slide-in-from-top-4 duration-300">
			<Collapsible
				open={props.isOptionsOpen}
				onOpenChange={props.setIsOptionsOpen}
			>
				<CollapsibleContent>
					<div className="p-5 rounded-2xl bg-muted/20 border border-border/50 shadow-inner mb-4 animate-in slide-in-from-top-2 duration-300">
						<div className="max-h-[400px] sm:max-h-[450px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
							<Suspense fallback={<AdvancedConfigSkeleton />}>
								<AdvancedConfigGrid {...props} />
							</Suspense>
						</div>
					</div>
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
};
