import { cva } from "class-variance-authority";

export const badgeVariants = cva(
	"inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-primary/90 text-primary-foreground shadow-sm hover:bg-primary backdrop-blur-sm",
				secondary:
					"border-transparent bg-secondary/80 text-secondary-foreground hover:bg-secondary backdrop-blur-sm",
				destructive:
					"border-transparent bg-destructive/90 text-white shadow-sm hover:bg-destructive backdrop-blur-sm",
				outline:
					"border-border bg-transparent text-foreground hover:bg-accent/50 hover:text-accent-foreground backdrop-blur-md",
				glass: "bg-white/10 dark:bg-black/20 backdrop-blur-md border-white/20 dark:border-white/10 text-foreground shadow-xl ring-1 ring-white/10",
				ghost: "border-transparent bg-transparent hover:bg-accent/50 hover:text-accent-foreground",
				link: "border-transparent text-primary underline-offset-4 hover:underline",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);
