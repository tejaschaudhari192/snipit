import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FileText, Trash2, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { localStore } from "@/utils/storage";
import { lazy, Suspense, useState, useEffect } from "react";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { usePageTitle } from "@/hooks/use-page-title";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { playRemoveSound } from "@/utils";
import { useSnippets } from "@/context/SnippetContext";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
const SnippetCard = lazy(() =>
	import("@/components/snippets/snippet-card").then((m) => ({
		default: m.SnippetCard,
	})),
);

const HistoryPage = () => {
	const { t, i18n } = useTranslation();
	const { history, loadHistory } = useSnippets();
	usePageTitle("history.title");
	const { items, loading, hasMore, isLoadingMore } = history;
	const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

	const loaderRef = useInfiniteScroll({
		hasMore,
		isLoading: isLoadingMore,
		loadMore: () => loadHistory(false),
	});

	useEffect(() => {
		if (items.length === 0) {
			loadHistory(true);
		}
	}, [loadHistory, items.length]);

	const handleClearHistory = () => setIsClearDialogOpen(true);

	const confirmClearHistory = () => {
		playRemoveSound();
		localStore.removeItem("items");
		// Refresh both history and profile if needed, or just clear local
		window.location.reload(); // Simplest way to clear everything and re-sync
	};

	return (
		<div className="relative min-h-[90vh] bg-background p-4 md:p-8 overflow-x-hidden w-full">
			<div className="max-w-3xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
					<div>
						<h1 className="text-3xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
							{t("history.title")}
						</h1>
						{items.length > 0 && (
							<p className="text-muted-foreground mt-1">
								{new Intl.NumberFormat(i18n.language).format(
									items.length,
								)}{" "}
								{items.length !== 1
									? t("history.snippets_saved")
									: t("history.snippet_saved")}
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
							<Suspense
								key={item.id}
								fallback={<ShimmerSection type="card" />}
							>
								<SnippetCard
									item={item}
									index={index}
									showViews={false}
								/>
							</Suspense>
						))}

						{/* Infinite Scroll Trigger */}
						<div
							ref={loaderRef}
							className="h-10 flex items-center justify-center mt-4"
						>
							{isLoadingMore && (
								<div className="flex items-center gap-2 text-muted-foreground animate-in fade-in duration-300">
									<Loader2 className="h-5 w-5 animate-spin text-primary" />
									<span>{t("common.loading")}</span>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			<DeleteConfirmDialog
				isOpen={isClearDialogOpen}
				onOpenChange={setIsClearDialogOpen}
				onConfirm={confirmClearHistory}
				title={t("history.clear_history")}
				description={t("history.clear_confirm")}
			/>
		</div>
	);
};

export default HistoryPage;
