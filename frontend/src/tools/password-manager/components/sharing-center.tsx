import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Shield, Lock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/tools/password-manager/store";
import { selectSharedCollections, fetchSharedCollections, fetchVaultData } from "@/tools/password-manager/store/password-slice";
import { Badge } from "@/components/ui/badge";
import CollectionMembersModal from "./collection-members-modal";
import ShareFolderModal from "./share-folder-modal";

import type { SharedCollection } from "@/tools/password-manager/types";

export default function SharingCenter() {
	const [activeTab, setActiveTab] = useState("with-me");
	const [selectedCollection, setSelectedCollection] = useState<SharedCollection | null>(null);
	const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
	const [isShareNewModalOpen, setIsShareNewModalOpen] = useState(false);
	
	const dispatch = useAppDispatch();
	const sharedCollections = useAppSelector(selectSharedCollections);

	useEffect(() => {
		dispatch(fetchSharedCollections()).then(() => dispatch(fetchVaultData()));
	}, [dispatch]);

	const sharedWithMe = sharedCollections.filter(c => c.access.role !== "owner");
	const sharedByMe = sharedCollections.filter(c => c.access.role === "owner");

	const renderCollectionCard = (coll: SharedCollection, isOwner: boolean) => (
		<div key={coll.collection.id} className="p-4 border border-white/5 rounded-xl bg-black/20 hover:bg-black/40 transition-colors flex items-center justify-between">
			<div className="flex items-center gap-4">
				<div className="p-3 rounded-full bg-primary/10 text-primary">
					{coll.collection.isHidden ? <Lock className="w-5 h-5" /> : <Users className="w-5 h-5" />}
				</div>
				<div>
					<h4 className="font-medium text-white/90">{coll.collection.name}</h4>
					<p className="text-xs text-muted-foreground mt-1">
						{coll.items.length} item{coll.items.length !== 1 ? 's' : ''} • Role: <span className="capitalize text-white/70">{coll.access.role}</span>
					</p>
				</div>
			</div>
			{isOwner && (
				<Button 
					variant="ghost" 
					size="sm" 
					className="gap-2 text-muted-foreground hover:text-white"
					onClick={() => {
						setSelectedCollection(coll);
						setIsMembersModalOpen(true);
					}}
				>
					<Settings className="w-4 h-4" />
					Manage Access
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
						Sharing Center
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						Manage your securely shared passwords and collections.
					</p>
				</div>
				<Button className="gap-2" onClick={() => setIsShareNewModalOpen(true)}>
					<UserPlus className="w-4 h-4" />
					Share New Collection
				</Button>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="bg-black/50 border border-white/5 w-full justify-start p-1 rounded-lg">
					<TabsTrigger
						value="with-me"
						className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex gap-2"
					>
						Shared with Me
						<Badge variant="secondary" className="bg-black/40 hover:bg-black/40 rounded-sm px-1.5 py-0 text-xs">
							{sharedWithMe.length}
						</Badge>
					</TabsTrigger>
					<TabsTrigger
						value="by-me"
						className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex gap-2"
					>
						Shared by Me
						<Badge variant="secondary" className="bg-black/40 hover:bg-black/40 rounded-sm px-1.5 py-0 text-xs">
							{sharedByMe.length}
						</Badge>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="with-me" className="mt-6 space-y-4">
					{sharedWithMe.length === 0 ? (
						<div className="flex flex-col items-center justify-center p-12 border border-white/5 rounded-xl bg-black/20 text-center">
							<Shield className="w-12 h-12 text-muted-foreground/50 mb-4" />
							<h3 className="text-lg font-medium text-white/80">No items shared with you</h3>
							<p className="text-sm text-muted-foreground mt-2 max-w-sm">
								When someone shares a password with you using End-to-End Encryption, it will appear here.
							</p>
						</div>
					) : (
						<div className="grid gap-3">
							{sharedWithMe.map(c => renderCollectionCard(c, false))}
						</div>
					)}
				</TabsContent>

				<TabsContent value="by-me" className="mt-6 space-y-4">
					{sharedByMe.length === 0 ? (
						<div className="flex flex-col items-center justify-center p-12 border border-white/5 rounded-xl bg-black/20 text-center">
							<Users className="w-12 h-12 text-muted-foreground/50 mb-4" />
							<h3 className="text-lg font-medium text-white/80">You haven't shared anything yet</h3>
							<p className="text-sm text-muted-foreground mt-2 max-w-sm">
								Share items individually from their details page, or create a collection here.
							</p>
						</div>
					) : (
						<div className="grid gap-3">
							{sharedByMe.map(c => renderCollectionCard(c, true))}
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
