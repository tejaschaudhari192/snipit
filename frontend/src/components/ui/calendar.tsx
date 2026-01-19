"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayPickerProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export type CalendarProps = DayPickerProps;

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	...props
}: CalendarProps) {
	const [displayMonth, setDisplayMonth] = React.useState<Date>(
		() => new Date(),
	);

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

	const handleMonthChange = (monthIndex: string) => {
		const newDate = new Date(displayMonth);
		newDate.setMonth(parseInt(monthIndex));
		setDisplayMonth(newDate);
	};

	const handleYearSelect = (year: string) => {
		const newDate = new Date(displayMonth);
		newDate.setFullYear(parseInt(year));
		setDisplayMonth(newDate);
	};

	return (
		<div className={cn("p-3", className)}>
			{/* Custom Month/Year Header */}
			<div className="flex items-center justify-center gap-2 mb-4">
				{/* Month Dropdown */}
				<Select
					value={displayMonth.getMonth().toString()}
					onValueChange={handleMonthChange}
				>
					<SelectTrigger className="w-[120px] h-8 text-sm font-medium">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{MONTHS.map((month, index) => {
							const isPastMonth =
								displayMonth.getFullYear() === currentYear &&
								index < new Date().getMonth();
							return (
								<SelectItem
									key={month}
									value={index.toString()}
									disabled={isPastMonth}
								>
									{month}
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>

				{/* Year Dropdown */}
				<Select
					value={displayMonth.getFullYear().toString()}
					onValueChange={handleYearSelect}
				>
					<SelectTrigger className="w-[80px] h-8 text-sm font-medium">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{years.map((year) => (
							<SelectItem key={year} value={year.toString()}>
								{year}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Calendar Grid */}
			<DayPicker
				showOutsideDays={showOutsideDays}
				month={displayMonth}
				onMonthChange={setDisplayMonth}
				classNames={{
					months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
					month: "space-y-4",
					month_caption: "hidden",
					caption_label: "hidden",
					nav: "hidden",
					button_previous: "hidden",
					button_next: "hidden",
					month_grid: "w-full border-collapse space-y-1",
					weekdays: "flex justify-between",
					weekday:
						"text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
					week: "flex w-full mt-2 justify-between",
					day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
					day_button: cn(
						buttonVariants({ variant: "ghost" }),
						"h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-primary/10 transition-colors",
					),
					selected:
						"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md overflow-hidden",
					today: "bg-accent text-accent-foreground",
					outside:
						"day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
					disabled: "text-muted-foreground opacity-50",
					range_middle:
						"aria-selected:bg-accent aria-selected:text-accent-foreground",
					hidden: "invisible",
					...classNames,
				}}
				components={{
					Chevron: ({ orientation }) => {
						if (orientation === "left") {
							return <ChevronLeft className="h-4 w-4" />;
						}
						return <ChevronRight className="h-4 w-4" />;
					},
				}}
				disabled={{ before: new Date() }}
				{...props}
			/>
		</div>
	);
}
Calendar.displayName = "Calendar";

export { Calendar };
