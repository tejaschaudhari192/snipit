import { Input } from "@/components/ui/input";
import { Link as LinkIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LinkViewProps {
	isEdit: boolean;
	content: string;
	onContentChange: (val: string) => void;
	contentRef: (node: HTMLElement | null) => void;
}

export const LinkView = ({
	isEdit,
	content,
	onContentChange,
	contentRef,
}: LinkViewProps) => {
	const { t } = useTranslation();

	if (isEdit) {
		return (
			<div
				ref={contentRef}
				className="flex flex-col items-center py-16 px-4 bg-background/60 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl ring-1 ring-white/5 relative z-10 animate-in fade-in zoom-in-95 duration-700 max-w-[600px] mx-auto mt-4 w-full"
			>
				<div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-xl shadow-primary/5">
					<LinkIcon className="w-10 h-10 text-primary" />
				</div>
				<h3 className="text-2xl font-black mb-3">
					{t("home.tab_link")}
				</h3>
				<p className="text-muted-foreground mb-8 text-center max-w-sm font-medium">
					{t("home.link_desc")}
				</p>
				<div className="w-full max-w-md">
					<Input
						value={content}
						onChange={(e) => onContentChange(e.target.value)}
						placeholder={t("home.link_placeholder")}
						className="h-12 text-base px-5 rounded-xl border-primary/20 focus-visible:ring-primary/20 bg-background shadow-inner text-center"
					/>
				</div>
			</div>
		);
	}

	return (
		<div
			ref={contentRef}
			className="flex flex-col items-center justify-center py-24 px-4 bg-background/60 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl ring-1 ring-white/5 relative z-10 animate-in fade-in zoom-in-95 duration-700 max-w-[600px] mx-auto mt-10"
		>
			<div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-xl shadow-primary/5">
				<LinkIcon className="w-10 h-10 text-primary" />
			</div>
			<h3 className="text-2xl font-black mb-3">
				{t("common.redirect_ready")}
			</h3>
			<p className="text-muted-foreground mb-8 text-center max-w-md font-medium">
				{t("common.redirect_desc")}
			</p>
			<a
				href={
					/^https?:\/\//i.test(content)
						? content
						: `https://${content}`
				}
				target="_blank"
				rel="noopener noreferrer"
				className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-200 bg-primary rounded-2xl hover:bg-primary/90 shadow-xl shadow-primary/20 active:scale-95"
			>
				{t("common.visit_link")}
				<div className="ml-2 group-hover:translate-x-1 transition-transform">
					🚀
				</div>
			</a>
		</div>
	);
};
