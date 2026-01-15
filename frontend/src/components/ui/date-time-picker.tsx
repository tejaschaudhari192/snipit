"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function DateTimePicker({
	date,
	setDate,
}: {
	date: Date | undefined;
	setDate: (date: Date | undefined) => void;
}) {
	const [isOpen, setIsOpen] = React.useState(false);

	const hours = Array.from({ length: 12 }, (_, i) => i + 1);
	const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

	const handleDateSelect = (selectedDate: Date | undefined) => {
		if (selectedDate) {
			const newDate = date ? new Date(date) : new Date();
			newDate.setFullYear(selectedDate.getFullYear());
			newDate.setMonth(selectedDate.getMonth());
			newDate.setDate(selectedDate.getDate());
			setDate(newDate);
		}
	};

	const handleTimeChange = (
		type: "hour" | "minute" | "ampm",
		value: string,
	) => {
		const newDate = date ? new Date(date) : new Date();
		if (type === "hour") {
			const h = parseInt(value);
			const isPM = newDate.getHours() >= 12;
			newDate.setHours(isPM ? (h % 12) + 12 : h % 12);
		} else if (type === "minute") {
			newDate.setMinutes(parseInt(value));
		} else if (type === "ampm") {
			const currentHours = newDate.getHours();
			if (value === "PM" && currentHours < 12) {
				newDate.setHours(currentHours + 12);
			} else if (value === "AM" && currentHours >= 12) {
				newDate.setHours(currentHours - 12);
			}
		}
		setDate(newDate);
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-full justify-start text-left font-normal h-11 border-input bg-background hover:bg-accent/50 transition-colors",
						!date && "text-muted-foreground",
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? (
						format(date, "MM/dd/yyyy hh:mm aa")
					) : (
						<span>MM/DD/YYYY hh:mm aa</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-auto p-0 border border-border shadow-xl rounded-xl overflow-hidden bg-popover"
				align="start"
			>
				<div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border">
					<div className="p-3 bg-card/10">
						<Calendar
							mode="single"
							selected={date}
							onSelect={handleDateSelect}
							initialFocus
						/>
					</div>

					<div className="flex sm:h-[320px] divide-x divide-border">
						{/* Hours */}
						<div className="flex flex-col">
							<div className="text-[10px] uppercase font-bold text-muted-foreground text-center py-2 border-b border-border bg-muted/30">
								Hr
							</div>
							<ScrollArea className="flex-1 w-14">
								<div className="flex flex-col p-1.5 gap-1.5">
									{hours.map((hour) => (
										<Button
											key={hour}
											variant={
												date &&
												date.getHours() % 12 ===
													hour % 12
													? "default"
													: "ghost"
											}
											className="h-8 w-full shrink-0 text-xs font-medium"
											onClick={() =>
												handleTimeChange(
													"hour",
													hour.toString(),
												)
											}
										>
											{hour}
										</Button>
									))}
								</div>
								<ScrollBar orientation="vertical" />
							</ScrollArea>
						</div>

						{/* Minutes */}
						<div className="flex flex-col">
							<div className="text-[10px] uppercase font-bold text-muted-foreground text-center py-2 border-b border-border bg-muted/30">
								Min
							</div>
							<ScrollArea className="flex-1 w-14">
								<div className="flex flex-col p-1.5 gap-1.5">
									{minutes.map((minute) => (
										<Button
											key={minute}
											variant={
												date &&
												date.getMinutes() === minute
													? "default"
													: "ghost"
											}
											className="h-8 w-full shrink-0 text-xs font-medium"
											onClick={() =>
												handleTimeChange(
													"minute",
													minute.toString(),
												)
											}
										>
											{minute.toString().padStart(2, "0")}
										</Button>
									))}
								</div>
								<ScrollBar orientation="vertical" />
							</ScrollArea>
						</div>

						{/* AM/PM */}
						<div className="flex flex-col">
							<div className="text-[10px] uppercase font-bold text-muted-foreground text-center py-2 border-b border-border bg-muted/30">
								Per
							</div>
							<div className="flex flex-col p-1.5 gap-1.5">
								{["AM", "PM"].map((ampm) => (
									<Button
										key={ampm}
										variant={
											date &&
											((ampm === "AM" &&
												date.getHours() < 12) ||
												(ampm === "PM" &&
													date.getHours() >= 12))
												? "default"
												: "ghost"
										}
										className="h-10 w-12 shrink-0 text-xs font-bold"
										onClick={() =>
											handleTimeChange("ampm", ampm)
										}
									>
										{ampm}
									</Button>
								))}
							</div>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
