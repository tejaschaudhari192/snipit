import { useEffect, useRef } from "react";
import { FileText, ChevronRight, Inbox, Loader2 } from "lucide-react";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SnippetCard } from "@/components/snippets/snippet-card";
import { useTranslation } from "react-i18next";
import type { PasteData } from "@/types";

interface ProfileSnippetListProps {
	pastes: PasteData[];
	loading: boolean;
	loadMore: () => void;
	hasMore: boolean;
	isLoadingMore: boolean;
}

export const ProfileSnippetList = ({
	pastes,
	loading,
	loadMore,
	hasMore,
	isLoadingMore,
}: ProfileSnippetListProps) => {
	const { t } = useTranslation();
	const loaderRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const target = entries[0];
				if (target.isIntersecting && hasMore && !isLoadingMore) {
					loadMore();
				}
			},
			{ threshold: 0.1 },
		);

		const currentLoader = loaderRef.current;
		if (currentLoader) {
			observer.observe(currentLoader);
		}

		return () => {
			if (currentLoader) {
				observer.unobserve(currentLoader);
			}
		};
	}, [hasMore, isLoadingMore, loadMore]);

	return (
		<div className="md:col-span-8 space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
				<h2 className="text-3xl font-black flex items-center gap-3 tracking-tight">
					<FileText className="h-7 w-7 text-primary" />
					{t("profile.your_snippets", "Snippets")}
				</h2>
				<Link to="/">
					<Button
						size="sm"
						className="gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform w-full sm:w-auto"
					>
						{t("header.new_snippet", "New")}
						<ChevronRight className="h-4 w-4" />
					</Button>
				</Link>
			</div>

			{loading ? (
				<div className="grid gap-4 mt-8">
					{[...Array(3)].map((_, i) => (
						<ShimmerSection key={i} type="card" />
					))}
				</div>
			) : pastes.length === 0 ? (
				<div className="bg-background/60 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5 rounded-3xl border border-border/50 p-8 md:p-20 text-center relative z-10 animate-in fade-in zoom-in-95 duration-500">
					<div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
						<Inbox className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
					</div>
					<h3 className="text-2xl font-semibold mb-2">
						{t("profile.no_snippets", "No snippets yet")}
					</h3>
					<p className="text-muted-foreground mb-8 text-lg">
						{t(
							"profile.no_snippets_desc",
							"Your shared code masterpieces will appear here!",
						)}
					</p>
					<Link to="/">
						<Button
							size="lg"
							className="rounded-full px-8 shadow-xl shadow-primary/20 hover:scale-105 transition-transform font-bold"
						>
							{t(
								"profile.create_first",
								"Create Your First Snippet",
							)}
						</Button>
					</Link>
				</div>
			) : (
				<div className="grid gap-4">
					{pastes.map((paste, idx) => (
						<SnippetCard key={paste.id} item={paste} index={idx} />
					))}

					{/* Infinite Scroll Trigger */}
					<div
						ref={loaderRef}
						className="h-10 flex items-center justify-center mt-4"
					>
						{isLoadingMore && (
							<div className="flex items-center gap-2 text-muted-foreground animate-in fade-in duration-300">
								<Loader2 className="h-5 w-5 animate-spin text-primary" />
								<span>{t("common.loading", "Loading...")}</span>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
