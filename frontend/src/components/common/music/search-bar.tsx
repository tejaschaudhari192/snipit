import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CONFIG } from "@/configurations";

interface SearchBarProps {
	onSearch: (query: string) => void;
	isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
	const { t } = useTranslation();
	const [searchQuery, setSearchQuery] = useState("");
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);

	useEffect(() => {
		if (!searchQuery.trim()) {
			setSuggestions([]);
			return;
		}

		const delayDebounce = setTimeout(async () => {
			try {
				const response = await fetch(
					`${CONFIG.apiBaseUrl}/music/suggestions?q=${encodeURIComponent(
						searchQuery,
					)}`,
				);
				if (response.ok) {
					const data = await response.json();
					setSuggestions(data);
				}
			} catch (error) {
				console.error("Failed to fetch suggestions:", error);
			}
		}, 300);

		return () => clearTimeout(delayDebounce);
	}, [searchQuery]);

	const handleExecuteSearch = () => {
		if (searchQuery.trim()) {
			onSearch(searchQuery);
			setShowSuggestions(false);
		}
	};

	return (
		<div className="relative flex items-center gap-2 w-full min-w-0">
			<div className="relative flex-1 min-w-0">
				<Input
					type="text"
					placeholder={t("music.search_placeholder")}
					value={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.target.value);
						setShowSuggestions(true);
					}}
					onFocus={() => setShowSuggestions(true)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleExecuteSearch();
						} else if (e.key === "Escape") {
							setShowSuggestions(false);
						}
					}}
					className="h-8 text-xs w-full bg-background border-border min-w-0 pr-6"
				/>
				{searchQuery && (
					<button
						onClick={() => {
							setSearchQuery("");
							setSuggestions([]);
						}}
						className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground outline-none"
					>
						<X className="w-3 h-3" />
					</button>
				)}
			</div>
			<Button
				size="sm"
				disabled={isLoading}
				onClick={handleExecuteSearch}
				className="h-8 text-xs font-medium px-3 shrink-0"
			>
				{t("music.search")}
			</Button>

			{/* Suggestions Popover */}
			{showSuggestions && suggestions.length > 0 && (
				<>
					<div
						className="fixed inset-0 z-40"
						onClick={() => setShowSuggestions(false)}
					/>
					<div className="absolute left-0 right-[72px] top-9 z-50 bg-background/95 border border-border/80 rounded-md shadow-xl backdrop-blur-md max-h-[180px] overflow-y-auto py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
						{suggestions.map((suggestion, index) => (
							<button
								key={index}
								onClick={() => {
									setSearchQuery(suggestion);
									setShowSuggestions(false);
									onSearch(suggestion);
								}}
								className="w-full text-left px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/65 transition-colors truncate flex items-center gap-2 font-sans"
							>
								<Search className="w-3 h-3 text-muted-foreground/50 shrink-0" />
								{suggestion}
							</button>
						))}
					</div>
				</>
			)}
		</div>
	);
};

export default SearchBar;
