import React from "react";
import { Home, Folder } from "lucide-react";
import type { FolderData } from "@/types";
import { useTranslation } from "react-i18next";
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface FolderBreadcrumbProps {
	activeFolderId: string | null;
	folders: FolderData[];
	onNavigate: (id: string | null) => void;
}

export const FolderBreadcrumb: React.FC<FolderBreadcrumbProps> = ({
	activeFolderId,
	folders,
	onNavigate,
}) => {
	const { t } = useTranslation();
	// Build breadcrumb path
	const getPath = (): FolderData[] => {
		if (!activeFolderId) return [];
		const activeFolder = folders.find((f) => f._id === activeFolderId);
		if (!activeFolder) return [];

		// path is in format like ",root,folderId1,folderId2,"
		const segments = activeFolder.path
			.split(",")
			.filter((s) => s && s !== "root");

		const pathFolders: FolderData[] = [];
		for (const segmentId of segments) {
			const folder = folders.find((f) => f._id === segmentId);
			if (folder) {
				pathFolders.push(folder);
			}
		}
		pathFolders.push(activeFolder);
		return pathFolders;
	};

	const path = getPath();

	return (
		<Breadcrumb>
			<BreadcrumbList className="text-xs select-none">
				<BreadcrumbItem>
					{activeFolderId === null ? (
						<BreadcrumbPage className="flex items-center gap-1 font-bold text-primary">
							<Home className="w-3.5 h-3.5" />
							<span>{t("folders.root")}</span>
						</BreadcrumbPage>
					) : (
						<BreadcrumbLink
							onClick={() => onNavigate(null)}
							className="flex items-center gap-1 font-bold hover:text-primary transition-colors cursor-pointer"
						>
							<Home className="w-3.5 h-3.5" />
							<span>{t("folders.root")}</span>
						</BreadcrumbLink>
					)}
				</BreadcrumbItem>

				{path.map((folder, index) => {
					const isLast = index === path.length - 1;
					return (
						<React.Fragment key={folder._id}>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								{isLast ? (
									<BreadcrumbPage className="flex items-center gap-1 font-black text-primary">
										<Folder
											className="w-3.5 h-3.5 shrink-0"
											style={{
												color:
													folder.color || undefined,
											}}
										/>
										<span className="truncate max-w-35">
											{folder.name}
										</span>
									</BreadcrumbPage>
								) : (
									<BreadcrumbLink
										onClick={() => onNavigate(folder._id)}
										className="flex items-center gap-1 font-bold hover:text-primary transition-colors cursor-pointer"
									>
										<Folder
											className="w-3.5 h-3.5 shrink-0"
											style={{
												color:
													folder.color || undefined,
											}}
										/>
										<span className="truncate max-w-35">
											{folder.name}
										</span>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
						</React.Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
};
