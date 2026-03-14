import type { PasteData } from "@/types";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FileText, Trash2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { useApiHelpers } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { SnippetCard } from "@/components/snippet-card";
import { Particles } from "@/components/ui/shadcn-io/particles";
import { useTheme } from "@/hooks/use-theme";
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
	const { t } = useTranslation();
	const { user } = useAuth();
	const apiHelpers = useApiHelpers();
	const { theme } = useTheme();
	// Warm amber/orange for history - feels like memories/records
	const particleColor = theme === "dark" ? "#fbbf24" : "#d97706";

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
		<div className="relative min-h-[90vh] bg-gradient-to-br from-background via-muted/20 to-background p-4 md:p-8 overflow-hidden">
			{/* Particles Background */}
			<Particles
				className="absolute inset-0 z-0"
				quantity={80}
				staticity={60}
				ease={80}
				size={0.4}
				color={particleColor}
				vx={0.02}
				vy={0.02}
			/>

			<div className="max-w-5xl mx-auto relative z-10">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
				>
					<div>
						<h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
							{t("history.title")}
						</h1>
						{items.length > 0 && (
							<p className="text-muted-foreground mt-1">
								{items.length}{" "}
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
				</motion.div>

				{loading ? (
					<div className="flex flex-col items-center justify-center p-20 gap-4">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<p className="text-muted-foreground italic">
							{t(
								"history.fetching_history",
								"Fetching your history...",
							)}
						</p>
					</div>
				) : items.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-16 text-center shadow-lg"
					>
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
					</motion.div>
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
				<AlertDialogContent size="sm">
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
