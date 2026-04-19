import {
	Code,
	Sparkles,
	Clock,
	Languages,
	Moon,
	Link2,
	Hash,
	Share2,
	User,
	Lock,
	ShieldCheck,
	FileUp,
	Users,
	Wand2,
	Terminal,
	FileDown,
	Palette,
} from "lucide-react";

const app = {
	features: [
		{
			icon: Code,
			key: "syntax_highlighting",
			gradient: "from-violet-500 to-purple-500",
		},
		{
			icon: Share2,
			key: "sharing",
			gradient: "from-blue-500 to-indigo-500",
		},
		{
			icon: Palette,
			key: "drawing",
			gradient: "from-orange-500 to-amber-500",
		},
		{
			icon: Terminal,
			key: "terminal_execution",
			gradient: "from-zinc-700 to-slate-900",
		},
		{
			icon: Wand2,
			key: "ai_edit_assistant",
			gradient: "from-purple-600 to-indigo-500",
		},
		{
			icon: Users,
			key: "real_time_collaboration",
			gradient: "from-blue-600 to-cyan-500",
		},
		{
			icon: FileUp,
			key: "file_share",
			gradient: "from-rose-500 to-pink-500",
		},
		{
			icon: Link2,
			key: "redirect_urls",
			gradient: "from-indigo-500 to-purple-500",
		},
		{
			icon: Sparkles,
			key: "ai_detection",
			gradient: "from-pink-500 to-rose-500",
		},
		{
			icon: FileDown,
			key: "save_as_export",
			gradient: "from-blue-600 to-cyan-500",
		},
		{
			icon: Clock,
			key: "expiration",
			gradient: "from-amber-500 to-orange-500",
		},
		{
			icon: Hash,
			key: "custom_ids",
			gradient: "from-cyan-500 to-blue-500",
		},
		{
			icon: Lock,
			key: "password",
			gradient: "from-red-500 to-rose-500",
		},
		{
			icon: ShieldCheck,
			key: "access_control",
			gradient: "from-indigo-500 to-violet-500",
		},
		{
			icon: User,
			key: "profile",
			gradient: "from-green-500 to-emerald-500",
		},
		{
			icon: Moon,
			key: "dark_mode",
			gradient: "from-slate-500 to-zinc-600",
		},
		{
			icon: Languages,
			key: "multi_language",
			gradient: "from-emerald-500 to-teal-500",
		},
	],
	team: [
		{
			name: "Tejas Chaudhari",
			email: "jaybalaji192@gmail.com",
			github: "https://github.com/tejaschaudhari192",
			linkedin: "https://www.linkedin.com/in/tejaschaudhari192/",
			avatar: "https://avatars.githubusercontent.com/u/104405128?s=400&u=1285d0293657159a9e85e0709ee549c37198667e&v=4",
			roleKey: "about_page.team.roles.developer",
		},
		{
			name: "Durgesh Kapade",
			email: "durgeshkapade26@gmail.com",
			github: "https://github.com/durgeshkapade",
			linkedin: "https://www.linkedin.com/in/durgeshkapade/",
			avatar: "https://avatars.githubusercontent.com/u/135988213?v=4",
			roleKey: "about_page.team.roles.quality_engineer",
		},
	],
	faq: [
		{ key: "free" },
		{ key: "expiration" },
		{ key: "secure" },
		{ key: "edit" },
	],
};

export default app;
