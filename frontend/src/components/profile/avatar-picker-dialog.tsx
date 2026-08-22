import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Upload,
	Image as ImageIcon,
	Sparkles,
	Trash2,
	Check,
	RefreshCw,
} from "lucide-react";
import { MOCK_AVATARS } from "@/constants";
import { compressImageFile } from "@/utils";
import { toast } from "@/components/ui/toast";

interface AvatarPickerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentAvatar?: string;
	username: string;
	onSave: (avatar: string | undefined) => Promise<void>;
}

export const AvatarPickerDialog: React.FC<AvatarPickerDialogProps> = ({
	open,
	onOpenChange,
	currentAvatar,
	username,
	onSave,
}) => {
	const { t } = useTranslation();
	const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>(
		currentAvatar,
	);
	const [isSaving, setIsSaving] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Reset state when opened
	React.useEffect(() => {
		if (open) {
			setSelectedAvatar(currentAvatar);
		}
	}, [open, currentAvatar]);

	const initials = (username || "U").charAt(0).toUpperCase();

	// Process and compress image file to Base64 data URL (< 300KB)
	const processFile = async (file: File) => {
		try {
			const compressedDataUrl = await compressImageFile(file, 256, 0.85);
			setSelectedAvatar(compressedDataUrl);
		} catch (error) {
			console.error("Failed to compress avatar image:", error);
			toast.add({
				title: t("profile.avatar.invalid_image"),
				type: "error",
			});
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) processFile(file);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files?.[0];
		if (file) processFile(file);
	};

	const handleSave = async () => {
		try {
			setIsSaving(true);
			await onSave(selectedAvatar);
			onOpenChange(false);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-full sm:max-w-lg p-6 rounded-3xl gap-5 bg-card/95 backdrop-blur-2xl border-border/60">
				<DialogHeader className="gap-1.5 text-left">
					<DialogTitle className="text-lg font-black tracking-tight flex items-center gap-2">
						<Sparkles className="w-5 h-5 text-primary" />
						{t("profile.avatar.title")}
					</DialogTitle>
					<DialogDescription className="text-xs text-muted-foreground">
						{t("profile.avatar.description")}
					</DialogDescription>
				</DialogHeader>

				{/* Active Avatar Preview Card */}
				<div className="flex items-center gap-4 p-3 rounded-2xl bg-muted/40 border border-border/40">
					<Avatar className="h-14 w-14 rounded-2xl ring-2 ring-primary/30 shrink-0 shadow-sm bg-linear-to-br from-primary/20 via-primary/10 to-accent/20">
						<AvatarImage src={selectedAvatar} />
						<AvatarFallback className="rounded-2xl font-black text-primary text-lg bg-primary/10">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col min-w-0 flex-1">
						<span className="text-xs font-bold text-foreground truncate">
							{username}
						</span>
						<span className="text-[11px] text-muted-foreground truncate">
							{selectedAvatar
								? t("profile.avatar.custom_selected")
								: t("profile.avatar.default_initials")}
						</span>
					</div>
					{selectedAvatar && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSelectedAvatar(undefined)}
							className="h-8 gap-1 rounded-xl text-xs text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 cursor-pointer"
						>
							<Trash2 className="w-3.5 h-3.5" />
							<span>{t("common.actions.remove")}</span>
						</Button>
					)}
				</div>

				{/* Option Tabs */}
				<Tabs
					defaultValue="mocks"
					className="w-full flex flex-col gap-3"
				>
					<TabsList className="grid w-full grid-cols-2 h-10 rounded-xl p-1 bg-muted/60 border border-border/40">
						<TabsTrigger
							value="mocks"
							className="rounded-lg text-xs font-bold gap-2 cursor-pointer h-full data-active:bg-background data-active:text-primary data-active:shadow-xs transition-all"
						>
							<Sparkles className="w-3.5 h-3.5" />
							<span>{t("profile.avatar.tab_mocks")}</span>
						</TabsTrigger>
						<TabsTrigger
							value="upload"
							className="rounded-lg text-xs font-bold gap-2 cursor-pointer h-full data-active:bg-background data-active:text-primary data-active:shadow-xs transition-all"
						>
							<Upload className="w-3.5 h-3.5" />
							<span>{t("profile.avatar.tab_upload")}</span>
						</TabsTrigger>
					</TabsList>

					{/* Tab 1: Mock Avatars Grid */}
					<TabsContent
						value="mocks"
						className="focus-visible:outline-none"
					>
						<div className="grid grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1 pr-2">
							{MOCK_AVATARS.map((mockUrl, idx) => {
								const isSelected = selectedAvatar === mockUrl;
								return (
									<button
										key={idx}
										type="button"
										onClick={() =>
											setSelectedAvatar(mockUrl)
										}
										className={`group relative rounded-2xl p-1.5 border transition-all cursor-pointer flex items-center justify-center ${
											isSelected
												? "border-primary bg-primary/10 ring-2 ring-primary/40 scale-105"
												: "border-border/50 hover:border-primary/40 hover:bg-muted/40"
										}`}
									>
										<Avatar className="h-12 w-12 rounded-xl">
											<AvatarImage src={mockUrl} />
											<AvatarFallback className="rounded-xl">
												#{idx + 1}
											</AvatarFallback>
										</Avatar>
										{isSelected && (
											<div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
												<Check className="w-3 h-3 stroke-3" />
											</div>
										)}
									</button>
								);
							})}
						</div>
					</TabsContent>

					{/* Tab 2: Upload from Device */}
					<TabsContent
						value="upload"
						className="focus-visible:outline-none"
					>
						<input
							type="file"
							ref={fileInputRef}
							onChange={handleFileChange}
							accept="image/*"
							className="hidden"
						/>
						<div
							onDragOver={(e) => {
								e.preventDefault();
								setIsDragging(true);
							}}
							onDragLeave={() => setIsDragging(false)}
							onDrop={handleDrop}
							onClick={() => fileInputRef.current?.click()}
							className={`w-full flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
								isDragging
									? "border-primary bg-primary/5 scale-[0.99]"
									: "border-border/60 hover:border-primary/40 hover:bg-muted/30"
							}`}
						>
							<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-xs">
								<ImageIcon className="w-5 h-5" />
							</div>
							<p className="text-xs font-bold text-foreground">
								{t("profile.avatar.drop_prompt")}
							</p>
							<p className="text-[10px] text-muted-foreground mt-0.5">
								{t("profile.avatar.file_limits")}
							</p>
						</div>
					</TabsContent>
				</Tabs>

				{/* Dialog Footer Actions */}
				<DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onOpenChange(false)}
						disabled={isSaving}
						className="rounded-xl text-xs font-semibold cursor-pointer"
					>
						{t("common.actions.cancel")}
					</Button>
					<Button
						size="sm"
						onClick={handleSave}
						disabled={isSaving || selectedAvatar === currentAvatar}
						className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer shadow-sm"
					>
						{isSaving ? (
							<>
								<RefreshCw className="w-3.5 h-3.5 animate-spin" />
								<span>{t("common.states.saving")}</span>
							</>
						) : (
							<>
								<Check className="w-3.5 h-3.5" />
								<span>{t("common.actions.save")}</span>
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
