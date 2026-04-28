import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils";

interface MultiEmailInputProps {
	value: string[];
	onChange: (value: string[]) => void;
	placeholder?: string;
	className?: string;
	isReadOnly?: boolean;
	inputValue?: string;
	onInputChange?: (value: string) => void;
}

export function MultiEmailInput({
	value,
	onChange,
	placeholder = "Enter emails...",
	className,
	isReadOnly = false,
	inputValue,
	onInputChange,
}: MultiEmailInputProps) {
	const [internalInputValue, setInternalInputValue] = React.useState("");
	const currentInputValue =
		inputValue !== undefined ? inputValue : internalInputValue;
	const setCurrentInputValue = onInputChange || setInternalInputValue;
	const inputRef = React.useRef<HTMLInputElement>(null);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (isReadOnly) return;
		if (
			(e.key === "Enter" || e.key === "," || e.key === " ") &&
			currentInputValue.trim()
		) {
			e.preventDefault();
			addEmail(currentInputValue);
		} else if (
			e.key === "Backspace" &&
			!currentInputValue &&
			value.length > 0
		) {
			removeEmail(value[value.length - 1]);
		}
	};

	const addEmail = (email: string) => {
		if (isReadOnly) return;
		const trimmedEmail = email.trim().replace(/,/g, "");
		if (!trimmedEmail) return;

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(trimmedEmail)) {
			// Optional: Handle invalid email UI feedback, for now just ignoring or could shake/red border
			return;
		}

		if (!value.includes(trimmedEmail)) {
			onChange([...value, trimmedEmail]);
		}
		setCurrentInputValue("");
	};

	const removeEmail = (emailToRemove: string) => {
		if (isReadOnly) return;
		onChange(value.filter((email) => email !== emailToRemove));
	};

	return (
		<div
			className={cn(
				"flex flex-wrap items-center gap-2 p-2 rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
				isReadOnly &&
					"opacity-50 cursor-not-allowed focus-within:ring-0",
				className,
			)}
			onClick={() => !isReadOnly && inputRef.current?.focus()}
		>
			{value.map((email) => (
				<Badge key={email} variant="secondary" className="gap-1 pr-1">
					{email}
					{!isReadOnly && (
						<button
							type="button"
							className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
							onClick={(e) => {
								e.stopPropagation();
								removeEmail(email);
							}}
						>
							<X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
						</button>
					)}
				</Badge>
			))}
			{!isReadOnly && (
				<Input
					ref={inputRef}
					type="text"
					className="flex-1 border-0 bg-transparent p-0 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[150px] h-8"
					placeholder={value.length === 0 ? placeholder : ""}
					value={currentInputValue}
					onChange={(e) => setCurrentInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={() => {
						if (currentInputValue.trim()) {
							addEmail(currentInputValue);
						}
					}}
				/>
			)}
		</div>
	);
}
