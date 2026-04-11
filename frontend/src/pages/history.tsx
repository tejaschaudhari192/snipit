import type { PasteData } from "@/types";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FileText, Trash2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useApiHelpers } from "@/lib/api";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { SnippetCard } from "@/components/snippets/snippet-card";
import { playRemoveSound } from "@/lib/utils";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogMedia,
} from "@/components/ui/alert-dialog";

const HistoryPage = () => {
	const { t, i18n } = useTranslation();
	const { user } = useAuth();
	const apiHelpers = useApiHelpers();

	const [items, setItems] = useState<Array<PasteData>>([]);
	const [loading, setLoading] = useState(true);
	const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

	useEffect(() => {
		const loadHistory = async () => {
			setLoading(true);
			try {
				const stored = localStorage.getItem("items");
				const localItems: Array<PasteData> = stored
					? JSON.parse(stored)
					: [];

				let finalItems = [...localItems];

				if (user) {
					try {
						const userPastes = await apiHelpers.getUserPastes();

						const userPasteIds = new Set(
							userPastes.map((p: PasteData) => p.id),
						);
						const filteredLocal = localItems.filter(
							(p) => !userPasteIds.has(p.id),
						);
						finalItems = [...userPastes, ...filteredLocal];
					} catch (err) {
						console.error("Failed to fetch user pastes", err);
						toast.error(
							t(
								"history.sync_failed",
								"Failed to sync your account snippets",
							),
						);
					}
				}

				finalItems.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() -
						new Date(a.createdAt).getTime(),
				);

				setItems(finalItems);
			} finally {
				setLoading(false);
			}
		};

		loadHistory();
	}, [user, apiHelpers, t]);

	const handleClearHistory = () => setIsClearDialogOpen(true);

	const confirmClearHistory = () => {
		playRemoveSound();
		localStorage.removeItem("items");
		setItems([]);
		toast.success(t("history.cleared_success"));
		setIsClearDialogOpen(false);
	};

	return (
		<div className="relative min-h-[90vh] bg-background p-4 md:p-8 overflow-x-hidden w-full">
			<div className="max-w-3xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
					<div>
						<h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
							{t("history.title")}
						</h1>
						{items.length > 0 && (
							<p className="text-muted-foreground mt-1">
								{new Intl.NumberFormat(i18n.language).format(
									items.length,
								)}{" "}
								{items.length !== 1
									? t(
											"history.snippets_saved",
											"snippets saved",
										)
									: t(
											"history.snippet_saved",
											"snippet saved",
										)}
							</p>
						)}
					</div>
					{items.length > 0 && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleClearHistory}
							className="gap-2 text-destructive hover:text-destructive backdrop-blur-sm"
						>
							<Trash2 className="h-4 w-4" />
							{t("history.clear_history")}
						</Button>
					)}
				</div>

				{loading ? (
					<div className="grid gap-4 mt-8">
						{[...Array(5)].map((_, i) => (
							<ShimmerSection key={i} type="card" />
						))}
					</div>
				) : items.length === 0 ? (
					<div className="bg-background/60 backdrop-blur-2xl rounded-3xl border border-border/50 p-16 text-center shadow-2xl shadow-black/5 relative z-10 animate-in fade-in zoom-in-95 duration-500">
						<div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
							<Inbox className="h-10 w-10 text-muted-foreground" />
						</div>
						<h2 className="text-2xl font-semibold mb-3">
							{t("history.no_history_title")}
						</h2>
						<p className="text-muted-foreground mb-6 max-w-md mx-auto">
							{t("history.no_history_desc")}
						</p>
						<Link to="/">
							<Button
								size="lg"
								className="gap-2 shadow-lg shadow-primary/20"
							>
								<FileText className="h-4 w-4" />
								{t("history.create_first")}
							</Button>
						</Link>
					</div>
				) : (
					<div className="grid gap-4">
						{items.map((item, index) => (
							<SnippetCard
								key={item.id}
								item={item}
								index={index}
								showViews={false}
							/>
						))}
					</div>
				)}
			</div>

			<AlertDialog
				open={isClearDialogOpen}
				onOpenChange={setIsClearDialogOpen}
			>
				<AlertDialogContent
					size="sm"
					className="border border-border/50 bg-background/60 backdrop-blur-2xl shadow-2xl rounded-2xl ring-1 ring-white/5 overflow-hidden"
				>
					<AlertDialogHeader>
						<AlertDialogMedia className="bg-destructive/10 text-destructive">
							<Trash2 className="size-8" />
						</AlertDialogMedia>
						<AlertDialogTitle>
							{t("history.clear_history")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("history.clear_confirm")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel variant="ghost">
							{t("history.cancel")}
						</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={confirmClearHistory}
							className="font-bold"
						>
							{t("history.clear_action")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default HistoryPage;
