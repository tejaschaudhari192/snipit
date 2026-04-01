"use client";

import * as React from "react";
import { CalendarIcon, ChevronUp, ChevronDown, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface TimeSpinnerProps {
	value: number;
	onChange: (value: number) => void;
	min: number;
	max: number;
	label: string;
	padZero?: boolean;
}

function TimeSpinner({
	value,
	onChange,
	min,
	max,
	label,
	padZero = true,
}: TimeSpinnerProps) {
	const increment = () => {
		onChange(value >= max ? min : value + 1);
	};

	const decrement = () => {
		onChange(value <= min ? max : value - 1);
	};

	return (
		<div className="flex flex-col items-center gap-1">
			<span className="text-[10px] uppercase font-bold text-muted-foreground">
				{label}
			</span>
			<div className="flex flex-col items-center bg-muted/50 rounded-lg border border-border overflow-hidden">
				<button
					type="button"
					onClick={increment}
					className="w-12 h-8 flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
				>
					<ChevronUp className="h-4 w-4" />
				</button>
				<div className="w-12 h-10 flex items-center justify-center bg-background border-y border-border">
					<span className="text-lg font-bold tabular-nums">
						{padZero ? value.toString().padStart(2, "0") : value}
					</span>
				</div>
				<button
					type="button"
					onClick={decrement}
					className="w-12 h-8 flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
				>
					<ChevronDown className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}

interface AmPmToggleProps {
	value: "AM" | "PM";
	onChange: (value: "AM" | "PM") => void;
}

function AmPmToggle({ value, onChange }: AmPmToggleProps) {
	return (
		<div className="flex flex-col items-center gap-1">
			<span className="text-[10px] uppercase font-bold text-muted-foreground">
				Period
			</span>
			<div className="flex flex-col bg-muted/50 rounded-lg border border-border overflow-hidden">
				<button
					type="button"
					onClick={() => onChange("AM")}
					className={cn(
						"w-12 h-10 flex items-center justify-center text-xs font-bold transition-colors",
						value === "AM"
							? "bg-primary text-primary-foreground"
							: "hover:bg-accent text-muted-foreground hover:text-foreground",
					)}
				>
					AM
				</button>
				<button
					type="button"
					onClick={() => onChange("PM")}
					className={cn(
						"w-12 h-10 flex items-center justify-center text-xs font-bold transition-colors border-t border-border",
						value === "PM"
							? "bg-primary text-primary-foreground"
							: "hover:bg-accent text-muted-foreground hover:text-foreground",
					)}
				>
					PM
				</button>
			</div>
		</div>
	);
}

const formatDate = (date: Date): string => {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "2-digit",
		year: "numeric",
	}).format(date);
};

const formatTime = (date: Date): string => {
	return new Intl.DateTimeFormat("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	}).format(date);
};

export function DatePicker({
	date,
	setDate,
}: {
	date: Date | undefined;
	setDate: (date: Date | undefined) => void;
}) {
	const [isOpen, setIsOpen] = React.useState(false);

	const handleDateSelect = (selectedDate: Date | undefined) => {
		if (selectedDate) {
			const newDate = date ? new Date(date) : new Date();
			newDate.setFullYear(selectedDate.getFullYear());
			newDate.setMonth(selectedDate.getMonth());
			newDate.setDate(selectedDate.getDate());
			setDate(newDate);
			setIsOpen(false);
		}
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-full justify-start text-left font-normal h-11 border-input bg-background/50 hover:bg-accent/50 transition-colors",
						!date && "text-muted-foreground",
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? formatDate(date) : <span>Pick a date</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-auto p-0 border border-border shadow-2xl rounded-2xl overflow-hidden bg-popover ring-1 ring-white/5"
				align="center"
			>
				<Calendar
					mode="single"
					selected={date}
					onSelect={handleDateSelect}
					initialFocus
					className="p-3"
				/>
			</PopoverContent>
		</Popover>
	);
}

export function TimePicker({
	date,
	setDate,
}: {
	date: Date | undefined;
	setDate: (date: Date | undefined) => void;
}) {
	const [isOpen, setIsOpen] = React.useState(false);

	const getHour12 = () => {
		if (!date) return 12;
		const h = date.getHours() % 12;
		return h === 0 ? 12 : h;
	};

	const getMinute = () => {
		return date ? date.getMinutes() : 0;
	};

	const getAmPm = (): "AM" | "PM" => {
		return date && date.getHours() >= 12 ? "PM" : "AM";
	};

	const handleHourChange = (hour12: number) => {
		const newDate = date ? new Date(date) : new Date();
		const isPM = newDate.getHours() >= 12;
		const hour24 =
			hour12 === 12 ? (isPM ? 12 : 0) : isPM ? hour12 + 12 : hour12;
		newDate.setHours(hour24);
		setDate(newDate);
	};

	const handleMinuteChange = (minute: number) => {
		const newDate = date ? new Date(date) : new Date();
		newDate.setMinutes(minute);
		setDate(newDate);
	};

	const handleAmPmChange = (ampm: "AM" | "PM") => {
		const newDate = date ? new Date(date) : new Date();
		const currentHours = newDate.getHours();
		if (ampm === "PM" && currentHours < 12) {
			newDate.setHours(currentHours + 12);
		} else if (ampm === "AM" && currentHours >= 12) {
			newDate.setHours(currentHours - 12);
		}
		setDate(newDate);
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-full justify-start text-left font-normal h-11 border-input bg-background/50 hover:bg-accent/50 transition-colors",
						!date && "text-muted-foreground",
					)}
				>
					<Clock className="mr-2 h-4 w-4" />
					{date ? formatTime(date) : <span>Set time</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-auto p-4 border border-border shadow-2xl rounded-2xl overflow-hidden bg-popover ring-1 ring-white/5"
				align="center"
			>
				<div className="flex flex-col justify-center">
					<div className="text-xs font-bold text-muted-foreground mb-4 text-center uppercase tracking-wider">
						Set Time
					</div>
					<div className="flex items-center gap-2 justify-center">
						<TimeSpinner
							value={getHour12()}
							onChange={handleHourChange}
							min={1}
							max={12}
							label="Hr"
							padZero={false}
						/>
						<div className="flex flex-col items-center justify-center h-full pt-5">
							<span className="text-xl font-bold text-muted-foreground">
								:
							</span>
						</div>
						<TimeSpinner
							value={getMinute()}
							onChange={handleMinuteChange}
							min={0}
							max={59}
							label="Min"
						/>
						<AmPmToggle
							value={getAmPm()}
							onChange={handleAmPmChange}
						/>
					</div>
					<div className="mt-6 pt-4 border-t border-border/50">
						<div className="text-[10px] font-bold text-muted-foreground mb-3 text-center uppercase tracking-widest">
							Quick Set
						</div>
						<div className="grid grid-cols-3 gap-1.5">
							{[
								{ label: "9 AM", hour: 9, min: 0 },
								{ label: "12 PM", hour: 12, min: 0 },
								{ label: "6 PM", hour: 18, min: 0 },
							].map((preset) => (
								<Button
									key={preset.label}
									variant="secondary"
									size="sm"
									className="h-8 text-[10px] font-bold"
									onClick={() => {
										const newDate = date
											? new Date(date)
											: new Date();
										newDate.setHours(
											preset.hour,
											preset.min,
											0,
											0,
										);
										setDate(newDate);
									}}
								>
									{preset.label}
								</Button>
							))}
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

export function DateTimePicker({
	date,
	setDate,
}: {
	date: Date | undefined;
	setDate: (date: Date | undefined) => void;
}) {
	return (
		<div className="grid grid-cols-2 gap-2 sm:gap-3">
			<DatePicker date={date} setDate={setDate} />
			<TimePicker date={date} setDate={setDate} />
		</div>
	);
}
