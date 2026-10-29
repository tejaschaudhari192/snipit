import React, { useState, useCallback } from "react";
import { CustomAlertModal, CustomAlertConfig } from "../components/CustomAlertModal";

export function useCustomAlert(theme: "dark" | "light" = "dark") {
	const [alertConfig, setAlertConfig] = useState<CustomAlertConfig>({
		visible: false,
		title: "",
	});

	const hideAlert = useCallback(() => {
		setAlertConfig((prev) => ({ ...prev, visible: false }));
	}, []);

	const showAlert = useCallback(
		(
			title: string,
			message?: string,
			type: "info" | "success" | "warning" | "error" = "info",
			buttons?: CustomAlertConfig["buttons"]
		) => {
			// Wrap each button's onPress to auto-close before running the action
			const wrappedButtons = buttons?.map((btn) => ({
				...btn,
				onPress: () => {
					setAlertConfig((prev) => ({ ...prev, visible: false }));
					// Defer the action slightly so the fade-out animation can start first
					if (btn.onPress) {
						setTimeout(btn.onPress, 80);
					}
				},
			}));

			setAlertConfig({
				visible: true,
				title,
				message,
				type,
				buttons: wrappedButtons,
				onDismiss: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
			});
		},
		[]
	);

	const alertModal = (
		<CustomAlertModal
			config={alertConfig}
			theme={theme}
		/>
	);

	return {
		alertConfig,
		setAlertConfig,
		showAlert,
		hideAlert,
		alertModal,
	};
}
