import { useCallback } from "react";

export const useThemeTransition = () => {
	const startTransition = useCallback(
		(updateFn: () => void, event?: React.MouseEvent | MouseEvent) => {
			if (
				!document.startViewTransition ||
				window.matchMedia("(prefers-reduced-motion: reduce)").matches
			) {
				updateFn();
				return;
			}

			const x = event?.clientX ?? window.innerWidth / 2;
			const y = event?.clientY ?? window.innerHeight / 2;
			const endRadius = Math.hypot(
				Math.max(x, window.innerWidth - x),
				Math.max(y, window.innerHeight - y),
			);

			const transition = document.startViewTransition(async () => {
				updateFn();
			});

			transition.ready.then(() => {
				document.documentElement.animate(
					{
						clipPath: [
							`circle(0px at ${x}px ${y}px)`,
							`circle(${endRadius}px at ${x}px ${y}px)`,
						],
					},
					{
						duration: 500,
						easing: "cubic-bezier(0.4, 0, 0.2, 1)",
						pseudoElement: "::view-transition-new(root)",
					},
				);
			});
		},
		[],
	);

	return { startTransition };
};
