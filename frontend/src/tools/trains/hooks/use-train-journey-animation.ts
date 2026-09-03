import { useState, useEffect, useRef, useCallback } from "react";
import type { TrainLiveStatusResponse } from "../types/trains";

interface UseTrainJourneyAnimationOptions {
	liveStatus: TrainLiveStatusResponse | null;
	tableContainerRef: React.RefObject<HTMLDivElement | null>;
}

export interface TrainPosition {
	x: number;
	y: number;
}

/**
 * Custom hook managing the top-down train journey gliding animation.
 * The train slides smoothly along the railway track like a real train on rails
 * while the page scrolls to keep the train anchored at the center of the screen.
 */
export function useTrainJourneyAnimation({
	liveStatus,
	tableContainerRef,
}: UseTrainJourneyAnimationOptions) {
	const [trainPos, setTrainPos] = useState<TrainPosition | null>(null);
	const [animatedStationIdx, setAnimatedStationIdx] = useState<number>(0);
	const [isAnimating, setIsAnimating] = useState<boolean>(false);

	const animationFrameRef = useRef<number | null>(null);
	const startTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const userScrolledRef = useRef<boolean>(false);

	// Find the main scrollable container element
	const getScrollContainer = useCallback((): HTMLElement => {
		const main =
			document.querySelector("main.overflow-y-auto") ||
			document.querySelector("main") ||
			document.documentElement;
		return (main as HTMLElement) || document.documentElement;
	}, []);

	// Measure exact center (X, Y) coordinates of all station nodes relative to the table container
	const measureStationCoordinates = useCallback(() => {
		const container = tableContainerRef.current;
		if (!container || !liveStatus?.stations?.length) return null;

		const containerRect = container.getBoundingClientRect();
		const coords: TrainPosition[] = [];

		for (const stn of liveStatus.stations) {
			const nodeEl = document.getElementById(
				`live-station-node-${stn.stationCode}`,
			);
			if (nodeEl) {
				const nodeRect = nodeEl.getBoundingClientRect();
				coords.push({
					x: nodeRect.left - containerRect.left + nodeRect.width / 2,
					y: nodeRect.top - containerRect.top + nodeRect.height / 2,
				});
			} else {
				// Fallback approximation
				const prevY = coords[coords.length - 1]?.y ?? 40;
				coords.push({
					x: coords[0]?.x ?? 28,
					y: prevY + 70,
				});
			}
		}

		return coords;
	}, [liveStatus, tableContainerRef]);

	// Run journey animation from station 0 to target station
	const runGlideAnimation = useCallback(
		(statusData: TrainLiveStatusResponse | null) => {
			if (!statusData?.stations || statusData.stations.length === 0)
				return;

			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
			if (startTimeoutRef.current) {
				clearTimeout(startTimeoutRef.current);
				startTimeoutRef.current = null;
			}

			userScrolledRef.current = false;

			const targetIdx = statusData.currentStation
				? statusData.stations.findIndex(
						(s) => s.stationCode === statusData.currentStation,
					)
				: 0;

			const finalIdx = targetIdx >= 0 ? targetIdx : 0;

			// Wait a tick for DOM nodes to be rendered and measured
			requestAnimationFrame(() => {
				const container = tableContainerRef.current;
				const stationCoords = measureStationCoordinates();
				if (!container || !stationCoords || stationCoords.length === 0)
					return;

				const startPos = stationCoords[0];
				const endPos = stationCoords[finalIdx] || startPos;

				// Place train at origin station
				setTrainPos(startPos);
				setAnimatedStationIdx(0);

				const scrollContainer = getScrollContainer();
				const viewportCenter = window.innerHeight / 2;

				// Smoothly center the origin station on screen first
				const initialTrainScreenY =
					container.getBoundingClientRect().top + startPos.y;
				const initialDiff = initialTrainScreenY - viewportCenter;
				if (Math.abs(initialDiff) > 2) {
					scrollContainer.scrollBy({
						top: initialDiff,
						behavior: "smooth",
					});
				}

				if (finalIdx === 0) {
					setIsAnimating(false);
					return;
				}

				setIsAnimating(true);

				// Listen for user manual scroll to prevent fighting the user
				const handleManualScroll = () => {
					userScrolledRef.current = true;
				};
				scrollContainer.addEventListener("wheel", handleManualScroll, {
					passive: true,
				});
				scrollContainer.addEventListener(
					"touchstart",
					handleManualScroll,
					{ passive: true },
				);

				// Wait 800ms so user clearly sees the origin station at center of screen before departure
				startTimeoutRef.current = setTimeout(() => {
					// Paced comfortably (~5-6s for long routes)
					const totalDuration = Math.min(
						7500,
						Math.max(3800, finalIdx * 240),
					);
					const startTime = performance.now();

					const startY = startPos.y;
					const endY = endPos.y;
					const totalDistance = endY - startY;
					const trainX = startPos.x;

					const tick = (now: number) => {
						const elapsed = now - startTime;
						const progress = Math.min(elapsed / totalDuration, 1);

						// Continuous sub-pixel vertical train position along track
						const currentY = startY + totalDistance * progress;
						setTrainPos({ x: trainX, y: currentY });

						// Highlight track and station nodes as the train physically passes them
						let activeStation = 0;
						for (let i = 0; i <= finalIdx; i++) {
							if (currentY >= stationCoords[i].y - 6) {
								activeStation = i;
							}
						}
						setAnimatedStationIdx(activeStation);

						// Smooth camera tracking: keep train pinned at the center of the screen
						if (!userScrolledRef.current) {
							const currentScreenY =
								container.getBoundingClientRect().top +
								currentY;
							const diff = currentScreenY - viewportCenter;
							if (Math.abs(diff) > 0.5) {
								scrollContainer.scrollTop += diff;
							}
						}

						if (progress < 1) {
							animationFrameRef.current =
								requestAnimationFrame(tick);
						} else {
							// Successfully arrived at destination station!
							setTrainPos(endPos);
							setAnimatedStationIdx(finalIdx);
							setIsAnimating(false);
							animationFrameRef.current = null;
							scrollContainer.removeEventListener(
								"wheel",
								handleManualScroll,
							);
							scrollContainer.removeEventListener(
								"touchstart",
								handleManualScroll,
							);
						}
					};

					animationFrameRef.current = requestAnimationFrame(tick);
				}, 800);
			});
		},
		[getScrollContainer, measureStationCoordinates, tableContainerRef],
	);

	// Initial setup when liveStatus loads or window resizes
	useEffect(() => {
		if (liveStatus) {
			runGlideAnimation(liveStatus);
		}

		const handleResize = () => {
			const coords = measureStationCoordinates();
			if (!coords || !liveStatus?.stations) return;
			const targetIdx = liveStatus.currentStation
				? liveStatus.stations.findIndex(
						(s) => s.stationCode === liveStatus.currentStation,
					)
				: 0;
			const finalIdx = targetIdx >= 0 ? targetIdx : 0;
			setTrainPos(coords[finalIdx]);
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			if (startTimeoutRef.current) {
				clearTimeout(startTimeoutRef.current);
			}
		};
	}, [liveStatus, measureStationCoordinates, runGlideAnimation]);

	return {
		trainPos,
		animatedStationIdx,
		isAnimating,
		replayJourney: () => runGlideAnimation(liveStatus),
	};
}
