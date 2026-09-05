import type { ToolModuleKnowledge } from "../types/voice.types";

export const SNIPIT_SITE_MANIFEST: ToolModuleKnowledge[] = [
	{
		id: "trains",
		name: "Indian Railways Tool",
		route: "/tools/trains",
		summary:
			"PNR tracking, train search between stations, live train status, and schedules.",
		description:
			"Full suite for Indian Railways with PNR status, live running status, and ticket generation.",
		actions: [
			{
				name: "CHECK_PNR",
				description:
					"Check booking confirmation, coach, and berth for a 10-digit PNR.",
				intentTriggers: [
					"pnr",
					"pnr status",
					"check ticket",
					"ticket status",
					"is my seat confirmed",
				],
				requiredParams: ["pnr"],
				navigationTarget: {
					path: "/tools/trains",
					tab: "pnr",
					paramMapping: { pnr: "pnr" },
				},
				domTarget: {
					inputSelector:
						"input[placeholder*='PNR'], input[data-voice='pnr-input']",
					submitSelector: "button:has-text('Check Status')",
				},
			},
			{
				name: "SEARCH_TRAINS",
				description:
					"Find trains between two stations on a given date.",
				intentTriggers: [
					"find trains",
					"trains between",
					"train from",
					"go from",
				],
				requiredParams: ["from", "to"],
				optionalParams: ["date"],
				navigationTarget: {
					path: "/tools/trains",
					tab: "search",
					paramMapping: { from: "from", to: "to", date: "date" },
				},
			},
			{
				name: "TRAIN_LIVE_STATUS",
				description:
					"Track live train location, delay, and current station.",
				intentTriggers: [
					"live train",
					"train status",
					"where is train",
					"live running",
				],
				requiredParams: ["trainNo"],
				navigationTarget: {
					path: "/tools/trains",
					tab: "live",
					paramMapping: { trainNo: "trainNo" },
				},
			},
			{
				name: "TRAIN_SCHEDULE",
				description: "View timetable and station stops for a train.",
				intentTriggers: ["train schedule", "timetable", "train stops"],
				requiredParams: ["trainNo"],
				navigationTarget: {
					path: "/tools/trains",
					tab: "schedule",
					paramMapping: { trainNo: "trainNo" },
				},
			},
		],
	},
	{
		id: "snippets",
		name: "Code Snippets & Pastes",
		route: "/",
		summary:
			"Create, view, and share code snippets with syntax highlighting and diagrams.",
		description:
			"Code pastebin with Monaco/Tiptap editors, password protection, and diagramming.",
		actions: [
			{
				name: "CREATE_SNIPPET",
				description: "Create a new code paste with title and language.",
				intentTriggers: [
					"create snippet",
					"new paste",
					"save code",
					"new snippet",
				],
				requiredParams: [],
				optionalParams: ["language", "title", "content"],
				navigationTarget: {
					path: "/",
				},
			},
		],
	},
	{
		id: "music",
		name: "Background Music Player",
		route: "*",
		summary: "Floating music player for lofi, focus, and study audio.",
		description:
			"Global floating player with search, play/pause, and playlist controls.",
		actions: [
			{
				name: "CONTROL_MUSIC",
				description:
					"Control playback or search songs in the floating music player.",
				intentTriggers: [
					"play music",
					"play song",
					"pause music",
					"stop music",
					"resume music",
					"next song",
				],
				requiredParams: ["action"],
				optionalParams: ["query"],
			},
		],
	},
	{
		id: "password_manager",
		name: "Password Manager & Generator",
		route: "/tools/password-manager",
		summary: "Secure password generator and credential vault.",
		description:
			"Generate high-entropy passwords and manage encrypted passwords.",
		actions: [
			{
				name: "GENERATE_PASSWORD",
				description: "Generate a secure random password.",
				intentTriggers: [
					"generate password",
					"new password",
					"create strong password",
				],
				requiredParams: [],
				optionalParams: ["length"],
				navigationTarget: {
					path: "/tools/password-manager",
				},
			},
		],
	},
	{
		id: "cinema",
		name: "Cinema Watch Party",
		route: "/tools/cinema",
		summary: "Synchronized video watch party with WebRTC voice/video.",
		description: "Create rooms and watch videos together with friends.",
		actions: [
			{
				name: "NAVIGATE",
				description: "Open the Cinema Watch Party room creation page.",
				intentTriggers: ["open cinema", "watch party", "cinema room"],
				requiredParams: ["path"],
				navigationTarget: {
					path: "/tools/cinema",
				},
			},
		],
	},
	{
		id: "global",
		name: "Global Navigation & Theme",
		route: "*",
		summary: "Switch dark/light theme, navigate to pages, or open tools.",
		description: "System actions across the site.",
		actions: [
			{
				name: "CHANGE_THEME",
				description:
					"Switch application theme between dark and light mode.",
				intentTriggers: [
					"dark mode",
					"light mode",
					"change theme",
					"toggle theme",
				],
				requiredParams: ["theme"],
			},
			{
				name: "NAVIGATE",
				description: "Navigate directly to any route or tool.",
				intentTriggers: [
					"go to",
					"open page",
					"navigate to",
					"show me",
				],
				requiredParams: ["path"],
			},
		],
	},
];
