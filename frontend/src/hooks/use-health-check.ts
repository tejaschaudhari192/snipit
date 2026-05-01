import { useState, useEffect, useRef } from "react";
import { CONFIG } from "@/configurations";
import type { HealthData } from "@/types";

export const useHealthCheck = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [healthData, setHealthData] = useState<HealthData | null>(null);
	const [error, setError] = useState<boolean>(false);
	const hasRun = useRef(false);

	useEffect(() => {
		if (hasRun.current) return;
		hasRun.current = true;

		const checkHealthStream = () => {
			const eventSource = new EventSource(
				`${CONFIG.apiBaseUrl}/health/stream`,
				{ withCredentials: true },
			);

			const currentHealth: HealthData = {
				status: "alive",
				services: {},
				progress: 0,
				currentLabel: "Initializing...",
			};

			eventSource.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					currentHealth.services[data.step] = {
						status: data.status,
						message: data.message || "",
					};
					currentHealth.progress = data.progress;
					currentHealth.currentLabel = data.label;
					currentHealth.icon = data.icon;

					if (data.status === "error" && data.step === "Database") {
						currentHealth.status = "down";
						setError(true);
						setLoading(false);
						eventSource.close();
					}

					setHealthData({ ...currentHealth });

					if (data.progress === 100) {
						eventSource.close();
						setTimeout(() => {
							setLoading(false);
						}, 1000);
					}
				} catch (err) {
					console.error("Failed to parse health stream data", err);
				}
			};

			eventSource.onerror = (e) => {
				console.error("Health stream error:", e);
				setError(true);
				setHealthData((prev) => ({
					status: "down",
					services: prev?.services || {},
				}));
				eventSource.close();
				setLoading(false);
			};
		};

		checkHealthStream();

		return () => {
			// Cleanup if necessary
		};
	}, []);

	return { loading, healthData, error };
};
