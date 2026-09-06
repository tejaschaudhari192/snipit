import type { ToolModuleKnowledge } from "../types/voice.types";

/**
 * Structured Site Knowledge Manifest for Snipit Voice Copilot.
 * Ordered strictly by user journey and application architecture:
 * 1. Primary Product Core: Code Pastes & Snippets (Editor, Viewer, Creation)
 * 2. Primary Navigation & Discovery: History, Explore, Jump To, Tools Hub
 * 3. Suite of Specialized Tools (in matching navigation/tool order):
 *    - Companion AI (/tools/companion)
 *    - Cinema Watch Party (/tools/cinema)
 *    - CryptoSafe Vault (/tools/cryptoSafe)
 *    - Password Manager & Generator (/tools/passwords)
 *    - Indian Railways & PNR Tracker (/tools/trains)
 * 4. User Account & Settings: Profile, Folders, Preferences (/profile)
 * 5. Global Utility Controls: Background Music, Theme Switcher, Universal Navigation
 * 6. Informational Pages: About (/about)
 * 7. Snippet Viewer: Display Page (/:id)
 * 8. Authentication: Login, Signup (/login, /signup)
 */
export const SNIPIT_SITE_MANIFEST: ToolModuleKnowledge[] = [
	// 1. CORE APPLICATION: CODE SNIPPETS & PASTES (Home & Creation Modes)
	{
		id: "snippets",
		name: "Code Snippets & Multi-Type Paste Creator",
		route: "/",
		summary:
			"Create and edit 6 distinct paste types: Code, Rich Docs, Whiteboard Drawing, URL Shortener, File Sharing, and Plain Text.",
		description:
			"The core paste engine supporting Monaco code editor (50+ languages, auto-detection, AI autocomplete, live terminal execution), Tiptap rich-text documents with WYSIWYG formatting, CollabDraw whiteboard canvas with AI drawing generation, fast URL shortener with redirection types, multi-file uploads with previews, and distraction-free plain text with transliteration.",
		actions: [
			{
				name: "CREATE_SNIPPET",
				description:
					"Create a code paste with Monaco editor, syntax highlighting, language detection, AI code completion, and terminal execution.",
				intentTriggers: [
					"create code snippet",
					"new code snippet",
					"paste code",
					"write code",
					"create program",
					"run code",
					"open code editor",
				],
				requiredParams: [],
				optionalParams: ["language", "title", "content", "mode"],
				navigationTarget: {
					path: "/?tab=code",
				},
			},
			{
				name: "CREATE_SNIPPET",
				description:
					"Create a rich-text document with Tiptap editor, formatting (headings, bold, lists, quotes, tables), and AI writer assistance.",
				intentTriggers: [
					"create document",
					"new document",
					"rich text note",
					"write doc",
					"create doc",
					"open docs",
					"formatted note",
				],
				requiredParams: [],
				optionalParams: ["title", "content", "mode"],
				navigationTarget: {
					path: "/?tab=docs",
				},
			},
			{
				name: "CREATE_SNIPPET",
				description:
					"Open the collaborative whiteboard drawing canvas with pencil, shapes, and AI-powered sketch generation.",
				intentTriggers: [
					"draw diagram",
					"new drawing",
					"open canvas",
					"sketch something",
					"whiteboard",
					"ai draw",
					"draw flow chart",
				],
				requiredParams: [],
				optionalParams: ["title", "mode"],
				navigationTarget: {
					path: "/?tab=draw",
				},
			},
			{
				name: "CREATE_SNIPPET",
				description:
					"Shorten a URL with customizable click/timer/direct redirection modes and link history.",
				intentTriggers: [
					"shorten link",
					"shorten url",
					"create short link",
					"new redirect",
					"tiny url",
				],
				requiredParams: [],
				optionalParams: ["content", "mode"],
				navigationTarget: {
					path: "/?tab=link",
				},
			},
			{
				name: "CREATE_SNIPPET",
				description:
					"Upload and share files with secure multi-file storage, live upload progress, and file previews.",
				intentTriggers: [
					"upload file",
					"share file",
					"upload document",
					"drop file",
					"attach file",
				],
				requiredParams: [],
				optionalParams: ["mode"],
				navigationTarget: {
					path: "/?tab=file",
				},
			},
			{
				name: "CREATE_SNIPPET",
				description:
					"Create a quick plain text note with native distraction-free editor, Indic transliteration, and text-to-speech audio.",
				intentTriggers: [
					"create note",
					"new text paste",
					"plain text",
					"quick note",
					"save text",
				],
				requiredParams: [],
				optionalParams: ["title", "content", "mode"],
				navigationTarget: {
					path: "/?tab=text",
				},
			},
			{
				name: "NAVIGATE",
				description: "Go to the home snippet editor.",
				intentTriggers: ["go home", "open editor", "homepage"],
				requiredParams: ["path"],
				navigationTarget: {
					path: "/",
				},
			},
		],
	},

	// 2. DISCOVERY & BROWSING: HISTORY & TOOLS HUB
	{
		id: "history",
		name: "Snippet History & Archive",
		route: "/history",
		summary:
			"Browse previously saved pastes, public snippets, and shared code history.",
		description:
			"Archive and search view of saved pastes with language filters, copy links, and tags.",
		actions: [
			{
				name: "NAVIGATE",
				description: "Open the Snippets History page.",
				intentTriggers: [
					"open history",
					"view history",
					"past snippets",
					"my pastes",
					"recent snippets",
				],
				requiredParams: ["path"],
				navigationTarget: {
					path: "/history",
				},
			},
		],
	},
	{
		id: "tools_hub",
		name: "Tools Directory",
		route: "/tools",
		summary:
			"Explore all specialized productivity tools in Snipit (Companion, Cinema, CryptoSafe, Passwords, Trains).",
		description:
			"Central hub to discover and launch Snipit's suite of utility applications.",
		actions: [
			{
				name: "NAVIGATE",
				description: "Navigate to the Tools directory.",
				intentTriggers: [
					"open tools",
					"all tools",
					"tools hub",
					"show tools",
				],
				requiredParams: ["path"],
				navigationTarget: {
					path: "/tools",
				},
			},
		],
	},

	// 3. SPECIALIZED PRODUCTIVITY TOOLS (Matching /tools list order)
	// 3.1 AI Companion
	{
		id: "companion",
		name: "AI Companion",
		route: "/tools/companion",
		summary:
			"Personal AI companion with long-term memory, voice conversation, and emotional consciousness.",
		description:
			"Interactive AI chat partner with persistent memory, persona evolution, and streaming voice playback.",
		actions: [
			{
				name: "NAVIGATE",
				description: "Open the AI Companion chat and voice interface.",
				intentTriggers: [
					"open companion",
					"ai companion",
					"talk to companion",
					"chat with companion",
					"open buddy",
				],
				requiredParams: ["path"],
				navigationTarget: {
					path: "/tools/companion",
				},
			},
			{
				name: "DOM_INPUT",
				description:
					"Type and send a message or question to your AI companion.",
				intentTriggers: [
					"tell companion",
					"ask companion",
					"send to companion",
					"say to buddy",
				],
				requiredParams: ["value"],
				domTarget: {
					inputSelector: "textarea[data-voice='companion-input']",
					submitSelector: "button[data-voice='companion-submit']",
				},
				navigationTarget: {
					path: "/tools/companion",
				},
			},
		],
	},

	// 3.2 Cinema Watch Party
	{
		id: "cinema",
		name: "Cinema Watch Party",
		route: "/tools/cinema",
		summary:
			"Synchronized video watch party rooms with live WebRTC voice/video chat.",
		description:
			"Watch YouTube or direct video streams simultaneously with friends in real-time synced rooms.",
		actions: [
			{
				name: "NAVIGATE",
				description: "Open Cinema Watch Party or join a video room.",
				intentTriggers: [
					"open cinema",
					"watch party",
					"watch movie together",
					"cinema room",
				],
				requiredParams: ["path"],
				navigationTarget: {
					path: "/tools/cinema",
				},
			},
		],
	},

	// 3.3 CryptoSafe Encryption Vault
	{
		id: "cryptsafe",
		name: "CryptoSafe Encryption Vault",
		route: "/tools/cryptoSafe",
		summary:
			"Client-side AES-GCM 256-bit text and file encryption and decryption.",
		description:
			"Zero-knowledge cryptography utility to securely encrypt and decrypt sensitive notes or payloads with passphrases.",
		actions: [
			{
				name: "NAVIGATE",
				description:
					"Open CryptoSafe encryption tab to encrypt text or sensitive notes with AES-GCM.",
				intentTriggers: [
					"encrypt text",
					"encrypt message",
					"encrypt note",
					"lock text",
					"secure text",
				],
				requiredParams: ["path"],
				navigationTarget: {
					path: "/tools/cryptoSafe?tab=encrypt",
				},
			},
			{
				name: "NAVIGATE",
				description:
					"Open CryptoSafe decryption tab to unlock or decrypt cipher text with a passphrase.",
				intentTriggers: [
					"decrypt message",
					"decrypt text",
					"unlock note",
					"open decrypt",
				],
				requiredParams: ["path"],
				navigationTarget: {
					path: "/tools/cryptoSafe?tab=decrypt",
				},
			},
			{
				name: "NAVIGATE",
				description:
					"Open CryptoSafe encryption and decryption dashboard.",
				intentTriggers: [
					"open cryptsafe",
					"crypto safe",
					"encryption tool",
				],
				requiredParams: ["path"],
				navigationTarget: {
					path: "/tools/cryptoSafe",
				},
			},
		],
	},

	// 3.4 Password Manager & Generator
	{
		id: "password_manager",
		name: "Password Manager & Generator",
		route: "/tools/passwords",
		summary:
			"Encrypted password vault and customizable strong password generator.",
		description:
			"Store credentials in local encrypted vaults and generate high-entropy randomized passwords.",
		actions: [
			{
				name: "GENERATE_PASSWORD",
				description:
					"Open password tool to generate a strong random password.",
				intentTriggers: [
					"generate password",
					"new password",
					"strong password",
					"create password",
				],
				requiredParams: [],
				optionalParams: ["length"],
				navigationTarget: {
					path: "/tools/passwords",
				},
			},
			{
				name: "NAVIGATE",
				description: "Open the Passwords Manager dashboard.",
				intentTriggers: [
					"open passwords",
					"password manager",
					"password vault",
					"my passwords",
				],
				requiredParams: ["path"],
				navigationTarget: {
					path: "/tools/passwords",
				},
			},
		],
	},

	// 3.5 Indian Railways & PNR Tracker
	{
		id: "trains",
		name: "Indian Railways Tool",
		route: "/tools/trains",
		summary:
			"Live Indian Railways PNR status check, trains between stations, live train tracking, and timetables.",
		description:
			"Railway utility for checking 10-digit PNR confirmations, seat prediction, running delays, and train stops.",
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
					"Find trains between two stations on a given journey date.",
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
					"Track live train location, current delay, and arriving station.",
				intentTriggers: [
					"live train",
					"train status",
					"where is train",
					"live running",
				],
				requiredParams: ["trainNo"],
				optionalParams: ["day"],
				navigationTarget: {
					path: "/tools/trains",
					tab: "live",
					paramMapping: { trainNo: "trainNo" },
				},
			},
			{
				name: "TRAIN_SCHEDULE",
				description:
					"View station stops and timetable for a train number.",
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

	// 4. USER PROFILE & SETTINGS
	{
		id: "profile",
		name: "User Profile & Settings",
		route: "/profile",
		summary:
			"Manage user profile, personal avatars, snippet folders, and account authentication.",
		description:
			"Personal dashboard for account credentials, custom avatar picker, and personal snippet organization.",
		actions: [
			{
				name: "NAVIGATE",
				description: "Open user profile and account settings.",
				intentTriggers: [
					"open profile",
					"my account",
					"user settings",
					"profile page",
				],
				requiredParams: ["path"],
				navigationTarget: {
					path: "/profile",
				},
			},
		],
	},

	// 5. GLOBAL AMBIENT CONTROLS (Theme, Music, Universal Nav)
	{
		id: "music",
		name: "Background Music Player",
		route: "*",
		summary:
			"Global floating music player for ambient lo-fi, focus audio, and music playback.",
		description:
			"Floating music player accessible anywhere in the app with playlist search and volume controls.",
		actions: [
			{
				name: "CONTROL_MUSIC",
				description:
					"Control music playback (play, pause, next, previous) or search songs.",
				intentTriggers: [
					"play music",
					"play song",
					"pause music",
					"stop music",
					"resume music",
					"next song",
					"previous song",
				],
				requiredParams: ["action"],
				optionalParams: ["query"],
			},
		],
	},
	{
		id: "global",
		name: "Global Controls & Theme",
		route: "*",
		summary:
			"System actions: switch between dark/light theme and direct page navigation.",
		description:
			"Universal commands to toggle UI appearance and jump anywhere in the application.",
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
					"switch theme",
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

	// 6. INFORMATIONAL PAGES
	{
		id: "about",
		name: "About Snipit",
		route: "/about",
		summary:
			"About page with project information, developer credits, and tech stack details.",
		description:
			"Static informational page describing Snipit's features, tech stack, and the creator.",
		actions: [
			{
				name: "NAVIGATE",
				description: "Open the About page.",
				intentTriggers: [
					"about page",
					"about snipit",
					"who made this",
					"about us",
				],
				requiredParams: ["path"],
				navigationTarget: {
					path: "/about",
				},
			},
		],
	},

	// 7. SNIPPET VIEWER (Display Page /:id)
	{
		id: "display",
		name: "Snippet Viewer",
		route: "/:id",
		summary:
			"Read-only snippet display page with syntax highlighting, sharing, and fork/save options.",
		description:
			"Shared snippet view accessed via unique paste ID. Supports code, markdown, rich text, diagrams, and file attachments.",
		actions: [
			{
				name: "NAVIGATE",
				description: "Open a specific snippet by its ID or short link.",
				intentTriggers: [
					"open snippet",
					"view paste",
					"show snippet",
					"open link",
				],
				requiredParams: ["path"],
				navigationTarget: {
					path: "/:id",
				},
			},
		],
	},

	// 8. AUTHENTICATION PAGES
	{
		id: "auth",
		name: "Authentication",
		route: "/login",
		summary:
			"User authentication pages: login, signup, forgot password, and reset password.",
		description:
			"Account access flows including email/password login, Google OAuth, new account registration, and password recovery.",
		actions: [
			{
				name: "NAVIGATE",
				description: "Open the login page.",
				intentTriggers: ["login", "sign in", "log in", "open login"],
				requiredParams: ["path"],
				navigationTarget: {
					path: "/login",
				},
			},
			{
				name: "NAVIGATE",
				description: "Open the signup page.",
				intentTriggers: [
					"signup",
					"sign up",
					"create account",
					"register",
				],
				requiredParams: ["path"],
				navigationTarget: {
					path: "/signup",
				},
			},
		],
	},
];
