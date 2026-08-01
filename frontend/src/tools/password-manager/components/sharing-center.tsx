import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Shield, Lock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/tools/password-manager/store";
import { selectSharedCollections } from "@/tools/password-manager/store/password-slice";
import { Badge } from "@/components/ui/badge";
import CollectionMembersModal from "./collection-members-modal";
import ShareFolderModal from "./share-folder-modal";

import type { SharedCollection } from "@/tools/password-manager/types";

export default function SharingCenter() {
	const [activeTab, setActiveTab] = useState("with-me");
	const [selectedCollection, setSelectedCollection] =
		useState<SharedCollection | null>(null);
	const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
	const [isShareNewModalOpen, setIsShareNewModalOpen] = useState(false);
	const { t } = useTranslation();

	const sharedCollections = useAppSelector(selectSharedCollections);

	const sharedWithMe = sharedCollections.filter(
		(c) => c.access.role !== "owner",
	);
	const sharedByMe = sharedCollections.filter(
		(c) => c.access.role === "owner",
	);

	const renderCollectionCard = (coll: SharedCollection, isOwner: boolean) => (
		<div
			key={coll.collection.id}
			className="p-4 border border-border rounded-xl bg-card hover:bg-accent transition-colors flex items-center justify-between"
		>
			<div className="flex items-center gap-4">
				<div className="p-3 rounded-full bg-primary/10 text-primary">
					{coll.collection.isHidden ? (
						<Lock className="w-5 h-5" />
					) : (
						<Users className="w-5 h-5" />
					)}
				</div>
				<div>
					<h4 className="font-medium text-foreground">
						{coll.collection.name}
					</h4>
					<p className="text-xs text-muted-foreground mt-1">
						{coll.items.length}{" "}
						{coll.items.length === 1
							? t("tools.password_manager.item_singular")
							: t("tools.password_manager.item_plural")}{" "}
						• {t("tools.password_manager.role")}:{" "}
						<span className="capitalize text-muted-foreground">
							{coll.access.role}
						</span>
					</p>
				</div>
			</div>
			{isOwner && (
				<Button
					variant="ghost"
					size="sm"
					className="gap-2 text-muted-foreground hover:text-foreground"
					onClick={() => {
						setSelectedCollection(coll);
						setIsMembersModalOpen(true);
					}}
				>
					<Settings className="w-4 h-4" />
					{t("tools.password_manager.manage_access")}
				</Button>
			)}
		</div>
	);

	return (
		<div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-semibold flex items-center gap-2">
						<Users className="w-6 h-6 text-primary" />
						{t("tools.password_manager.sharing_center_title")}
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						{t("tools.password_manager.sharing_center_desc")}
					</p>
				</div>
				<Button
					className="gap-2"
					onClick={() => setIsShareNewModalOpen(true)}
				>
					<UserPlus className="w-4 h-4" />
					{t("tools.password_manager.share_new_collection")}
				</Button>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full"
			>
				<TabsList className="bg-muted border border-border w-full justify-start p-1 rounded-lg">
					<TabsTrigger
						value="with-me"
						className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex gap-2"
					>
						{t("tools.password_manager.shared_with_me")}
						<Badge
							variant="secondary"
							className="bg-black/40 hover:bg-black/40 rounded-sm px-1.5 py-0 text-xs"
						>
							{sharedWithMe.length}
						</Badge>
					</TabsTrigger>
					<TabsTrigger
						value="by-me"
						className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex gap-2"
					>
						{t("tools.password_manager.shared_by_me")}
						<Badge
							variant="secondary"
							className="bg-black/40 hover:bg-black/40 rounded-sm px-1.5 py-0 text-xs"
						>
							{sharedByMe.length}
						</Badge>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="with-me" className="mt-6 space-y-4">
					{sharedWithMe.length === 0 ? (
						<div className="flex flex-col items-center justify-center p-12 border border-border rounded-xl bg-card text-center">
							<Shield className="w-12 h-12 text-muted-foreground/50 mb-4" />
							<h3 className="text-lg font-medium text-foreground">
								{t(
									"tools.password_manager.shared_with_me_empty",
								)}
							</h3>
							<p className="text-sm text-muted-foreground mt-2 max-w-sm">
								{t(
									"tools.password_manager.shared_with_me_empty_desc",
								)}
							</p>
						</div>
					) : (
						<div className="grid gap-3">
							{sharedWithMe.map((c) =>
								renderCollectionCard(c, false),
							)}
						</div>
					)}
				</TabsContent>

				<TabsContent value="by-me" className="mt-6 space-y-4">
					{sharedByMe.length === 0 ? (
						<div className="flex flex-col items-center justify-center p-12 border border-border rounded-xl bg-card text-center">
							<Users className="w-12 h-12 text-muted-foreground/50 mb-4" />
							<h3 className="text-lg font-medium text-foreground">
								{t("tools.password_manager.shared_by_me_empty")}
							</h3>
							<p className="text-sm text-muted-foreground mt-2 max-w-sm">
								{t(
									"tools.password_manager.shared_by_me_empty_desc",
								)}
							</p>
						</div>
					) : (
						<div className="grid gap-3">
							{sharedByMe.map((c) =>
								renderCollectionCard(c, true),
							)}
						</div>
					)}
				</TabsContent>
			</Tabs>

			{selectedCollection && (
				<CollectionMembersModal
					isOpen={isMembersModalOpen}
					onClose={() => setIsMembersModalOpen(false)}
					collectionId={selectedCollection?.collection.id || ""}
					collectionName={selectedCollection?.collection.name || ""}
				/>
			)}

			<ShareFolderModal
				isOpen={isShareNewModalOpen}
				onClose={() => setIsShareNewModalOpen(false)}
			/>
		</div>
	);
}
