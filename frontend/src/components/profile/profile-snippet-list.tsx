import { motion } from "motion/react";
import { FileText, ChevronRight, Loader2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SnippetCard } from "@/components/snippets/snippet-card";
import { useTranslation } from "react-i18next";
import type { PasteData } from "@/types";

interface ProfileSnippetListProps {
	pastes: PasteData[];
	loading: boolean;
}

export const ProfileSnippetList = ({
	pastes,
	loading,
}: ProfileSnippetListProps) => {
	const { t } = useTranslation();

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
				<div className="flex flex-col items-center justify-center py-24 gap-4 bg-muted/10 rounded-3xl border border-dashed border-border/50">
					<Loader2 className="h-10 w-10 animate-spin text-primary/50" />
					<p className="text-muted-foreground italic">
						{t(
							"profile.loading_pastes",
							"Summoning your creations...",
						)}
					</p>
				</div>
			) : pastes.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="bg-card/30 backdrop-blur-sm rounded-3xl border border-dashed border-border/60 p-8 md:p-20 text-center"
				>
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
				</motion.div>
			) : (
				<div className="grid gap-4">
					{pastes.map((paste, idx) => (
						<SnippetCard key={paste.id} item={paste} index={idx} />
					))}
				</div>
			)}
		</div>
	);
};
