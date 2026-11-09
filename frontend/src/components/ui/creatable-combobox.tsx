import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle, Search } from "lucide-react";

import { cn } from "cn";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export interface ComboboxOption {
	value: string;
	label: string;
	icon?: React.ReactNode;
	color?: string;
}

export interface CreatableComboboxProps {
	options: (string | ComboboxOption)[];
	value: string;
	onSelect: (value: string) => void;
	onCreate?: (newValue: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyPlaceholder?: string;
	createLabel?: (query: string) => React.ReactNode;
	isDisabled?: boolean;
	allowCreate?: boolean;
	className?: string;
	triggerClassName?: string;
	contentClassName?: string;
}

export function CreatableCombobox({
	options,
	value,
	onSelect,
	onCreate,
	placeholder = "Select an option...",
	searchPlaceholder = "Search or create...",
	emptyPlaceholder = "No matching options",
	createLabel,
	isDisabled = false,
	allowCreate = true,
	className,
	triggerClassName,
	contentClassName,
}: CreatableComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState("");
	const [highlightedIndex, setHighlightedIndex] = React.useState(0);
	const inputRef = React.useRef<HTMLInputElement>(null);

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (nextOpen) {
			setQuery("");
			setHighlightedIndex(0);
			setTimeout(() => {
				inputRef.current?.focus();
			}, 30);
		}
	};

	const handleQueryChange = (val: string) => {
		setQuery(val);
		setHighlightedIndex(0);
	};

	const formattedOptions: ComboboxOption[] = React.useMemo(() => {
		return options.map((opt) =>
			typeof opt === "string" ? { value: opt, label: opt } : opt,
		);
	}, [options]);

	const filteredOptions = React.useMemo(() => {
		const trimmed = query.trim().toLowerCase();
		if (!trimmed) return formattedOptions;
		return formattedOptions.filter(
			(opt) =>
				opt.label.toLowerCase().includes(trimmed) ||
				opt.value.toLowerCase().includes(trimmed),
		);
	}, [formattedOptions, query]);

	const exactMatch = React.useMemo(() => {
		const trimmed = query.trim().toLowerCase();
		if (!trimmed) return undefined;
		return formattedOptions.find(
			(opt) =>
				opt.label.toLowerCase() === trimmed ||
				opt.value.toLowerCase() === trimmed,
		);
	}, [formattedOptions, query]);

	const showCreateOption =
		allowCreate && query.trim().length > 0 && !exactMatch;

	const selectedOption = React.useMemo(() => {
		return formattedOptions.find((opt) => opt.value === value);
	}, [formattedOptions, value]);

	const handleSelect = (val: string) => {
		onSelect(val);
		setOpen(false);
		setQuery("");
	};

	const handleCreate = (name: string) => {
		const trimmed = name.trim();
		if (!trimmed) return;
		if (onCreate) {
			onCreate(trimmed);
		} else {
			onSelect(trimmed);
		}
		setOpen(false);
		setQuery("");
	};

	const totalItems = filteredOptions.length + (showCreateOption ? 1 : 0);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlightedIndex((prev) => (prev + 1) % (totalItems || 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlightedIndex(
				(prev) => (prev - 1 + (totalItems || 1)) % (totalItems || 1),
			);
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (
				showCreateOption &&
				highlightedIndex === filteredOptions.length
			) {
				handleCreate(query);
			} else if (filteredOptions[highlightedIndex]) {
				handleSelect(filteredOptions[highlightedIndex].value);
			} else if (showCreateOption) {
				handleCreate(query);
			}
		} else if (e.key === "Escape") {
			setOpen(false);
		}
	};

	return (
		<div className={cn("relative w-full", className)}>
			<Popover open={open} onOpenChange={handleOpenChange}>
				<PopoverTrigger
					role="combobox"
					aria-expanded={open}
					disabled={isDisabled}
					className={cn(
						"flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-hidden hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50",
						triggerClassName,
					)}
				>
					<div className="flex items-center gap-2 truncate text-left">
						{selectedOption?.icon}
						{selectedOption?.color && (
							<span
								className="h-2.5 w-2.5 shrink-0 rounded-full"
								style={{
									backgroundColor: selectedOption.color,
								}}
							/>
						)}
						<span
							className={cn(
								"truncate",
								!selectedOption && "text-muted-foreground",
							)}
						>
							{selectedOption
								? selectedOption.label
								: placeholder}
						</span>
					</div>
					<ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
				</PopoverTrigger>

				<PopoverContent
					align="start"
					className={cn(
						"w-(--anchor-width) min-w-56 p-1.5 shadow-md",
						contentClassName,
					)}
				>
					<div className="flex items-center gap-1.5 border-b border-border/60 px-2 pb-1.5 pt-0.5">
						<Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
						<Input
							ref={inputRef}
							value={query}
							onChange={(e) => handleQueryChange(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={searchPlaceholder}
							className="h-7 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0 dark:bg-transparent"
						/>
					</div>

					<div className="max-h-56 overflow-y-auto py-1">
						{filteredOptions.length === 0 && !showCreateOption && (
							<div className="px-2 py-3 text-center text-xs text-muted-foreground">
								{emptyPlaceholder}
							</div>
						)}

						{filteredOptions.map((option, idx) => {
							const isSelected = value === option.value;
							const isHighlighted = idx === highlightedIndex;

							return (
								<button
									key={option.value}
									type="button"
									onClick={() => handleSelect(option.value)}
									onMouseEnter={() =>
										setHighlightedIndex(idx)
									}
									className={cn(
										"flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs text-foreground transition-colors outline-hidden select-none",
										isHighlighted
											? "bg-accent text-accent-foreground"
											: "hover:bg-accent/60",
									)}
								>
									<div className="flex min-w-0 items-center gap-2">
										{option.icon}
										{option.color && (
											<span
												className="h-2 w-2 shrink-0 rounded-full"
												style={{
													backgroundColor:
														option.color,
												}}
											/>
										)}
										<span
											className={cn(
												"truncate",
												isSelected && "font-medium",
											)}
										>
											{option.label}
										</span>
									</div>
									<Check
										className={cn(
											"ml-2 h-3.5 w-3.5 shrink-0 text-primary",
											isSelected
												? "opacity-100"
												: "opacity-0",
										)}
									/>
								</button>
							);
						})}

						{showCreateOption && (
							<button
								type="button"
								onClick={() => handleCreate(query)}
								onMouseEnter={() =>
									setHighlightedIndex(filteredOptions.length)
								}
								className={cn(
									"flex w-full cursor-pointer items-center gap-2 rounded-lg border-t border-border/40 px-2 py-1.5 text-xs text-primary transition-colors outline-hidden select-none font-medium mt-1 pt-1.5",
									highlightedIndex === filteredOptions.length
										? "bg-accent text-primary"
										: "hover:bg-accent/60",
								)}
							>
								<PlusCircle className="h-3.5 w-3.5 shrink-0" />
								<span className="truncate">
									{createLabel
										? createLabel(query.trim())
										: `Create "${query.trim()}"`}
								</span>
							</button>
						)}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
