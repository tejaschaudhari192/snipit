export type AlertVariant = "info" | "success" | "warning" | "error";

export interface BaseModalProps {
	visible: boolean;
	onClose: () => void;
}

export interface ToastConfig {
	title?: string;
	message?: string;
	variant?: AlertVariant;
	duration?: number;
}
