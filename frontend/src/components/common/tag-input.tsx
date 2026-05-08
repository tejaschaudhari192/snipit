import { useState, useRef, type KeyboardEvent } from "react";
import { X, Tag } from "lucide-react";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";

interface TagInputProps {
	tags: string[];
	onTagsChange: (tags: string[]) => void;
	suggestions?: string[];
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	autoFocus?: boolean;
	hideTags?: boolean;
}

export const TagInput = ({
	tags,
	onTagsChange,
	suggestions = [],
	placeholder,
	className,
	disabled = false,
	autoFocus = false,
	hideTags = false,
}: TagInputProps) => {
	const { t } = useTranslation();
	const [inputValue, setInputValue] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			addTag();
		} else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
			removeTag(tags.length - 1);
		}
	};

	const addTag = () => {
		const newTag = inputValue.trim().toLowerCase();
		if (newTag && !tags.includes(newTag)) {
			onTagsChange([...tags, newTag]);
		}
		setInputValue("");
	};

	const removeTag = (indexToRemove: number) => {
		onTagsChange(tags.filter((_, index) => index !== indexToRemove));
	};

	// Filter suggestions
	const filteredSuggestions = suggestions.filter(
		(s) =>
			s.toLowerCase().includes(inputValue.toLowerCase()) &&
			!tags.includes(s),
	);

	return (
		<div className={cn("relative w-full", className)}>
			<div
				className={cn(
					"flex flex-wrap items-center gap-1.5 p-2 min-h-[42px] rounded-lg border bg-card/40 transition-all",
					isFocused && "border-primary ring-1 ring-primary/20",
					disabled && "opacity-50 cursor-not-allowed",
				)}
				onClick={() => !disabled && inputRef.current?.focus()}
			>
				{!hideTags &&
					tags.map((tag, index) => (
						<span
							key={index}
							className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold animate-in fade-in zoom-in-95 duration-200"
						>
							<Tag className="w-3 h-3" />
							{tag}
							{!disabled && (
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										removeTag(index);
									}}
									className="hover:bg-primary/20 rounded-full p-0.5 transition-colors focus:outline-none"
								>
									<X className="w-3 h-3" />
								</button>
							)}
						</span>
					))}
				{!disabled && (
					<input
						ref={inputRef}
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						placeholder={
							tags.length === 0
								? placeholder || t("common.add_label")
								: ""
						}
						className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-[13px] placeholder:text-muted-foreground focus:ring-0 p-0"
						disabled={disabled}
						autoFocus={autoFocus}
					/>
				)}
			</div>

			{/* Suggestions Dropdown */}
			{isFocused &&
				inputValue &&
				filteredSuggestions.length > 0 &&
				!disabled && (
					<div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border bg-popover text-popover-foreground shadow-md animate-in fade-in slide-in-from-top-2">
						<div className="p-1 max-h-[150px] overflow-auto no-scrollbar">
							{filteredSuggestions.map((suggestion, index) => (
								<div
									key={index}
									onMouseDown={(e) => {
										// Use onMouseDown instead of onClick so it fires before input blur
										e.preventDefault();
										if (!tags.includes(suggestion)) {
											onTagsChange([...tags, suggestion]);
											setInputValue("");
										}
									}}
									className="px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
								>
									{suggestion}
								</div>
							))}
						</div>
					</div>
				)}
		</div>
	);
};
