import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@/utils";

function Slider({
	className,
	defaultValue,
	value,
	min = 0,
	max = 100,
	...props
}: SliderPrimitive.Root.Props) {
	const _values = Array.isArray(value)
		? value
		: typeof value === "number"
			? [value]
			: Array.isArray(defaultValue)
				? defaultValue
				: typeof defaultValue === "number"
					? [defaultValue]
					: [min];

	return (
		<SliderPrimitive.Root
			className={cn(
				"relative flex w-full touch-none select-none items-center",
				className,
			)}
			data-slot="slider"
			defaultValue={defaultValue}
			value={value}
			min={min}
			max={max}
			thumbAlignment="edge"
			{...props}
		>
			<SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50">
				<SliderPrimitive.Track
					data-slot="slider-track"
					className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted select-none"
				>
					<SliderPrimitive.Indicator
						data-slot="slider-range"
						className="bg-primary select-none h-full"
					/>
				</SliderPrimitive.Track>
				{Array.from({ length: _values.length }, (_, index) => (
					<SliderPrimitive.Thumb
						data-slot="slider-thumb"
						key={index}
						className="block size-4 shrink-0 rounded-full border border-primary bg-background ring-offset-background shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
					/>
				))}
			</SliderPrimitive.Control>
		</SliderPrimitive.Root>
	);
}

export { Slider };
