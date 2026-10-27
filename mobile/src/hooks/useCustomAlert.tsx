import React, { useState, useCallback } from "react";
import { Alert, Platform } from "react-native";
import { CustomAlertModal, CustomAlertConfig } from "../components/CustomAlertModal";
import { useUIStyle } from "../core/UIStyleContext";

export function useCustomAlert(theme: "dark" | "light" = "dark") {
	const { uiStyle } = useUIStyle();
	const [alertConfig, setAlertConfig] = useState<CustomAlertConfig>({
		visible: false,
		title: "",
	});

	const showAlert = useCallback(
		(
			title: string,
			message?: string,
			type: "info" | "success" | "warning" | "error" = "info",
			buttons?: CustomAlertConfig["buttons"]
		) => {
			setAlertConfig({
				visible: true,
				title,
				message,
				type,
				buttons,
				onDismiss: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
			});
		},
		[]
	);

	const hideAlert = useCallback(() => {
		setAlertConfig((prev) => ({ ...prev, visible: false }));
	}, []);

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
