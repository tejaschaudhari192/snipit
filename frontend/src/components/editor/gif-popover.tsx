import { useState, useEffect, useRef, useCallback } from "react";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import { Loader2 } from "lucide-react";
import { CONFIG } from "@/configurations";
import { cn } from "@/utils";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";

interface GifPopoverProps {
	onSelect: (url: string) => void;
}

interface GifItem {
	id: string;
	url: string;
	title: string;
}

interface GiphyGifItem {
	id: string;
	images: {
		fixed_width: {
			url: string;
		};
	};
	title: string;
}

const FALLBACK_GIFS: GifItem[] = [
	{
		id: "fb_yes",
		url: "https://media.giphy.com/media/l0G18Vkz5391c498u2/giphy.gif",
		title: "Success / Yes",
	},
	{
		id: "fb_applause",
		url: "https://media.giphy.com/media/2xO4L2iIBgjw4/giphy.gif",
		title: "Applause",
	},
	{
		id: "fb_mindblown",
		url: "https://media.giphy.com/media/lXu72d4iKMD2o/giphy.gif",
		title: "Mind Blown",
	},
	{
		id: "fb_doge",
		url: "https://media.giphy.com/media/oBQZfQ2T0YC4w/giphy.gif",
		title: "Doge",
	},
	{
		id: "fb_cat",
		url: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",
		title: "Typing Cat",
	},
	{
		id: "fb_thumbsup",
		url: "https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif",
		title: "Thumbs Up",
	},
	{
		id: "fb_celebrate",
		url: "https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif",
		title: "Celebrate",
	},
	{
		id: "fb_shocked",
		url: "https://media.giphy.com/media/PUBxelwT57jsQ/giphy.gif",
		title: "Shocked Cat",
	},
	{
		id: "fb_dance",
		url: "https://media.giphy.com/media/l3V0lsGtTMSB5YNgc/giphy.gif",
		title: "Dance",
	},
	{
		id: "fb_popcorn",
		url: "https://media.giphy.com/media/hVTouqNmVKiMo/giphy.gif",
		title: "Eating Popcorn",
	},
];

// Fallback reaction GIFs to guarantee a beautiful experience even offline or if API key expires
const GifIcon = ({ className }: { className?: string }) => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
		<text
			x="5"
			y="14.5"
			fontSize="9"
			fontWeight="bold"
			fontFamily="sans-serif"
			fill="currentColor"
			stroke="none"
		>
			GIF
		</text>
	</svg>
);

export function GifPopover({ onSelect }: GifPopoverProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [gifs, setGifs] = useState<GifItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [offset, setOffset] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const searchTimeoutRef = useRef<number | null>(null);

	const fetchGifs = useCallback(
		async (query: string, isLoadMore = false) => {
			if (isLoadMore) {
				setLoadingMore(true);
			} else {
				setLoading(true);
				setOffset(0);
				setHasMore(true);
			}

			const currentOffset = isLoadMore ? offset : 0;
			const limit = 16;

			try {
				const url = query
					? `https://api.giphy.com/v1/gifs/search?api_key=${CONFIG.giphyApiKey}&q=${encodeURIComponent(query)}&limit=${limit}&offset=${currentOffset}`
					: `https://api.giphy.com/v1/gifs/trending?api_key=${CONFIG.giphyApiKey}&limit=${limit}&offset=${currentOffset}`;
				const res = await fetch(url);
				if (!res.ok) throw new Error("API failed");
				const json = await res.json();
				if (json.meta && json.meta.status === 403) {
					throw new Error("Giphy API Key Banned");
				}
				if (json.data && json.data.length > 0) {
					const formatted = json.data.map((item: GiphyGifItem) => ({
						id: item.id,
						url: item.images.fixed_width.url,
						title: item.title,
					}));
					setGifs((prev) =>
						isLoadMore ? [...prev, ...formatted] : formatted,
					);
					setOffset(currentOffset + limit);
					setHasMore(json.data.length === limit);
				} else {
					if (!isLoadMore) setGifs([]);
					setHasMore(false);
				}
			} catch (error) {
				console.error(
					"Failed to load GIFs, using fallback curated GIFs:",
					error,
				);
				if (!isLoadMore) {
					if (query) {
						const filtered = FALLBACK_GIFS.filter((gif) =>
							gif.title
								.toLowerCase()
								.includes(query.toLowerCase()),
						);
						setGifs(filtered);
					} else {
						setGifs(FALLBACK_GIFS);
					}
					setHasMore(false);
				}
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		},
		[offset],
	);

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const target = e.currentTarget;
		if (
			target.scrollHeight - target.scrollTop <=
				target.clientHeight + 20 &&
			!loading &&
			!loadingMore &&
			hasMore
		) {
			fetchGifs(searchQuery, true);
		}
	};

	// Debounced search trigger
	useEffect(() => {
		if (searchTimeoutRef.current) {
			window.clearTimeout(searchTimeoutRef.current);
		}

		if (isOpen) {
			searchTimeoutRef.current = window.setTimeout(() => {
				fetchGifs(searchQuery);
			}, 350);
		}

		return () => {
			if (searchTimeoutRef.current) {
				window.clearTimeout(searchTimeoutRef.current);
			}
		};
	}, [searchQuery, isOpen, fetchGifs]);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<Tooltip>
				<TooltipTrigger asChild>
					<PopoverTrigger asChild>
						<button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer">
							<GifIcon className="h-4.5 w-4.5" />
						</button>
					</PopoverTrigger>
				</TooltipTrigger>
				<TooltipContent className="flex flex-col items-center justify-center p-1.5 px-2.5 select-none bg-zinc-950 dark:bg-zinc-900 border border-border/20 text-white text-[11px] rounded-md font-sans z-50">
					<span className="font-semibold text-white">
						Search & Insert GIF
					</span>
				</TooltipContent>
			</Tooltip>
			<PopoverContent
				align="start"
				className="w-72 p-3 border border-border/50 bg-background shadow-2xl rounded-2xl flex flex-col gap-3 overflow-hidden"
			>
				{/* Search Box */}
				<input
					type="text"
					placeholder="Search GIF"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full h-8.5 px-3 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
					autoFocus
				/>

				{/* GIF Grid / Scroller */}
				<div
					onScroll={handleScroll}
					className={cn(
						"h-64 overflow-y-auto pr-1 custom-scrollbar min-h-0 flex flex-col relative w-full",
						loading || gifs.length === 0
							? "items-center justify-center"
							: "items-stretch justify-start",
					)}
				>
					{loading ? (
						<Loader2 className="h-6 w-6 animate-spin text-primary shrink-0" />
					) : gifs.length === 0 ? (
						<p className="text-[10px] text-muted-foreground">
							No GIFs found.
						</p>
					) : (
						<div className="grid grid-cols-2 gap-2 w-full pb-2">
							{gifs.map((gif) => (
								<button
									key={gif.id}
									onClick={() => {
										onSelect(gif.url);
										setIsOpen(false);
									}}
									className="group relative aspect-video w-full overflow-hidden rounded-lg border border-border/40 hover:border-primary/50 transition-colors cursor-pointer bg-muted/20 flex items-center justify-center"
								>
									<img
										src={gif.url}
										alt={gif.title}
										className="h-full w-full object-cover transition-transform group-hover:scale-105"
										loading="lazy"
									/>
								</button>
							))}
							{loadingMore && (
								<div className="col-span-2 py-2 flex items-center justify-center">
									<Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
								</div>
							)}
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
