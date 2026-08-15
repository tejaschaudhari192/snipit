import { Shield, Lock, Train, Film, type LucideIcon } from "lucide-react";

export interface ToolConfig {
	id: string;
	titleKey: string;
	descriptionKey: string;
	icon: LucideIcon;
	link: string;
}

export const TOOLS_CONFIG: ToolConfig[] = [
	{
		id: "cinema",
		titleKey: "tools.cinema.title",
		descriptionKey: "tools.cinema.description",
		icon: Film,
		link: "/tools/cinema",
	},
	{
		id: "cryptoSafe",
		titleKey: "tools.cryptoSafe_title",
		descriptionKey: "tools.cryptoSafe_description",
		icon: Shield,
		link: "/tools/cryptoSafe",
	},
	{
		id: "passwordManager",
		titleKey: "tools.password_manager.title",
		descriptionKey: "tools.password_manager.description",
		icon: Lock,
		link: "/tools/passwords",
	},
	{
		id: "pnrChecker",
		titleKey: "tools.pnr_checker.title",
		descriptionKey: "tools.pnr_checker.description",
		icon: Train,
		link: "/tools/pnr-checker",
	},
];
